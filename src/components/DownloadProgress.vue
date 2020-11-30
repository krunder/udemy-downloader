<template>
  <div class="download-progress">
    <progress-bar :percentage="progressPercentage" />

    {{ download.overall.filesCompleted }} / {{ download.overall.totalFiles }} files downloaded.
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';
import ProgressBar from './ProgressBar';

export default {
  name: 'DownloadProgress',

  components: {
    ProgressBar,
  },

  props: {
    download: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      downloadData: this.download,
      progressPercentage: Math.max(0, (this.download.overall.filesCompleted / this.download.overall.totalFiles) * 100),
    };
  },

  mounted() {
    ipcRenderer.on('downloads:updated', (evt, download) => {
      this.downloadData = download;
      this.progressPercentage = Math.max(0, (this.download.overall.filesCompleted / this.download.overall.totalFiles) * 100);
    });
  },
};
</script>
