<template>
  <div class="course-list__item">
    <div class="course-list__item__thumbnail">
      <img :src="course.image_125_H" :alt="course.title" />
    </div>
    <div class="course-list__item__contents">
      <div class="course-list__item__contents--heading">
        <strong>{{ course.title }}</strong>
      </div>

      <div class="course-list__item__contents--body">
        <small>{{ instructors }}</small>
      </div>

      <div v-if="!download" class="course-list__item__contents--actions">
        <div v-if="prepare.inProgress" class="prepare-progress">
          <progress-bar :percentage="progressPercentage" />

          Preparing course data...
        </div>

        <a v-else href="#" class="btn btn-red btn-small" @click.prevent="prepareDownload">
          <font-awesome-icon :icon="downloadIcon" />
        </a>
      </div>

      <div v-else class="course-list__item__contents--actions">
        <download-progress v-if="download && download.inProgress" :download="download" />
      </div>
    </div>
  </div>
</template>

<script>
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { ipcRenderer } from 'electron';
import { mapState } from 'vuex';
import sanitize from 'sanitize-filename';
import ProgressBar from '../components/ProgressBar';
import DownloadProgress from '../components/DownloadProgress';
import PQueue from 'p-queue';
import axios from '../plugins/axios';

const DOWNLOAD_METHOD_HLS = 'hls';

const CLASS_CHAPTER = 'chapter';
const CLASS_LECTURE = 'lecture';

export default {
  name: 'CourseListItem',

  components: {
    ProgressBar,
    DownloadProgress,
    FontAwesomeIcon,
  },

  props: {
    course: {
      type: Object,
      required: true,
    },
  },

  data() {
    let quality = this.$settings.get('download.quality');

    switch (quality) {
      case 'Highest':
        quality = '1080';
        break;
      case 'Lowest':
        quality = '144';
        break;
    }

    return {
      prepare: {
        inProgress: false,
        total: 0,
        current: 0,
        downloads: [],
      },
      queue: new PQueue({
        concurrency: 5,
      }),
      quality,
    };
  },

  computed: {
    ...mapState([
      'downloads',
    ]),
    download() {
      return this.downloads.find(download => download.course.id === this.course.id);
    },
    instructors() {
      return this.course.visible_instructors.map(instructor => instructor.display_name).join(', ');
    },
    downloadIcon() {
      return faDownload;
    },
    progressPercentage() {
      return (this.prepare.current / this.prepare.total) * 100;
    },
  },

  methods: {
    async prepareDownload() {
      this.prepare.inProgress = true;

      const { data: curriculumResponse } = await axios.get(`courses/${this.course.id}/cached-subscriber-curriculum-items`, {
        params: {
          'page_size': 100000,
        },
      });

      const rows = curriculumResponse.results;

      this.prepare.total = rows.filter(row => row._class === CLASS_LECTURE).length;

      const chapters = [];

      for (let i = 0; i < rows.length; i++) {
        if (rows[i]._class === CLASS_CHAPTER) {
          chapters.push({
            id: rows[i].id,
            title: (chapters.length + 1) + '. ' + rows[i].title,
            description: rows[i].description,
            lectures: [],
          });
        } else if (rows[i]._class === CLASS_LECTURE) {
          const lectures = chapters[chapters.length - 1].lectures;

          lectures.push({
            id: rows[i].id,
            title: `${lectures.length + 1}. ${rows[i].title}`,
          });
        }
      }

      for (let i = 0; i < chapters.length; i++) {
        await this.queue.addAll(
          chapters[i].lectures.map((lecture) => async () => {
            // Prepare lecture for download
            await this.prepareLecture(lecture, chapters[i]);

            // Increment prepared lecture count
            this.prepare.current++;
          })
        );
      }

      ipcRenderer.invoke('downloads:add-course', this.course, this.prepare.downloads);

      // Reset preparation data
      this.prepare.inProgress = false;
      this.prepare.current = 0;
      this.prepare.total = 0;
      this.prepare.downloads = [];
    },

    async prepareLecture(lecture, chapter) {
      const { data: lectureResponse } = await axios.get(`users/me/subscribed-courses/${this.course.id}/lectures/${lecture.id}?fields[asset]=stream_urls,download_urls,captions,title,filename,data,body&fields[lecture]=asset,supplementary_assets`);

      const destination = `${this.$settings.get('download.outputDir')}/${sanitize(this.course.title)}/${sanitize(chapter.title)}`;

      // Prepare video
      if (lectureResponse.asset.stream_urls) {
        const groupedVideos = lectureResponse.asset.stream_urls.Video.reduce((groups, video) => {
          return { ...groups, [video.label]: video };
        }, {});

        if (groupedVideos.Auto && this.$settings.get('download.method') === DOWNLOAD_METHOD_HLS) {
          this.prepare.downloads.push({
            quality: this.quality,
            type: this.$settings.get('download.method'),
            url: groupedVideos.Auto.file,
            filename: `${sanitize(lecture.title)}.ts`,
            destination,
          });
        } else {
          const video = this.getEligibleMp4Video(groupedVideos);

          this.prepare.downloads.push({
            quality: video.label,
            type: 'http',
            url: video.file,
            filename: `${sanitize(lecture.title)}.mp4`,
            destination,
          });
        }
      }

      // Prepare captions
      if (this.$settings.get('download.subtitles')) {
        if (lectureResponse.asset.captions && lectureResponse.asset.captions.length > 0) {
          const caption = lectureResponse.asset.captions[0];

          this.prepare.downloads.push({
            type: 'http',
            url: caption.url,
            filename: `${sanitize(lecture.title)}.srt`,
            destination,
          });
        }
      }

      // Prepare attachments
      if (this.$settings.get('download.attachments')) {
        const validAttachments = (lectureResponse.supplementary_assets || [])
            .filter(attachment => attachment.download_urls && attachment.download_urls.File && attachment.download_urls.File.length > 0);

        if (validAttachments.length > 0) {
          const downloads = validAttachments.reduce((accum, attachment) => {
            const items = attachment.download_urls.File.map(file => {
              return {
                type: 'http',
                url: file.file,
                filename: `${sanitize(attachment.title)}`,
                destination: `${destination}/${sanitize(lecture.title)}`,
              };
            });

            return [...accum, ...items];
          }, []);

          this.prepare.downloads = [...this.prepare.downloads, ...downloads];
        }
      }
    },

    getEligibleMp4Video(videos) {
      if (videos[this.quality]) {
        return videos[this.quality];
      }

      return Object.keys(videos).reduce(
        (accum, resolution) => (isNaN(resolution) || parseInt(resolution) > parseInt(this.quality)) ? accum : videos[resolution]
      );
    },
  },
};
</script>

<style lang="scss">
  .course-list__item {
    display: flex;
    margin-top: 15px;

    &__thumbnail {
      flex: 125px 0 0;
    }

    &__contents {
      flex: 1;
      text-align: left;
      padding: 2px 10px;

      &--heading {
        margin-bottom: 5px;
        font-size: 14px;
        max-width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      &--body {
        margin-bottom: 10px;
        font-size: 0.85rem;
      }

      &--actions {
        font-size: 0.75rem;

        .btn {
          font-size: 0.65rem;
        }
      }
    }
  }
</style>