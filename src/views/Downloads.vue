<template>
  <div class="dashboard main-layout">
    <download-list />
  </div>
</template>

<script>
import DownloadList from '../components/DownloadList';

export default {
  name: 'Downloads',

  components: {
    DownloadList,
  },
}
</script>

<style>
.dashboard {
  width: 100%;
}
</style>
