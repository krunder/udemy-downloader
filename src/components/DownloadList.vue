<template>
  <div class="download-list">
    <download-list-item v-for="download in downloads" :key="download.course.id" :download="download" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import DownloadListItem from '../components/DownloadListItem';

export default {
  name: 'DownloadList',

  components: {
    DownloadListItem,
  },

  computed: {
    ...mapState([
      'downloads',
    ]),
  },
};
</script>
