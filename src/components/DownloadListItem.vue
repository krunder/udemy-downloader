<template>
  <div class="download-list__item">
    <div class="download-list__item__thumbnail">
      <img :src="download.course.image_125_H" :alt="download.course.title" />
    </div>
    <div class="download-list__item__contents">
      <div class="download-list__item__contents--heading">
        <strong>{{ download.course.title }}</strong>
      </div>

      <div v-if="download.inProgress" class="download-list__item__contents--body">
        <download-progress :download="download" />
      </div>
    </div>
  </div>
</template>

<script>
import DownloadProgress from '../components/DownloadProgress';

export default {
  name: 'DownloadListItem',

  components: {
    DownloadProgress,
  },

  props: {
    download: {
      type: Object,
      required: true,
    },
  },

  computed: {
    instructors() {
      return this.download
        ? this.download.course.visible_instructors.map(instructor => instructor.display_name).join(', ')
        : '';
    },
  },
};
</script>

<style lang="scss">
  .download-list__item {
    display: flex;
    margin-top: 10px;

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
      }

      &--body {
        margin-bottom: 10px;
        font-size: 0.85rem;
      }

      &--actions {
        font-size: 0.75rem;

        &__btn {
          border: 2px solid #ec5252;
          color: #ec5252;
          font-size: 0.8rem;
          padding: 2px 10px;
          text-align: center;
          display: inline-block;

          &:hover {
            color: #fff;
            background-color: #ec5252;
          }
        }
      }
    }
  }
</style>
