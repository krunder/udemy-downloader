<template>
  <div class="progress-bar">
    <div class="progress-bar__bar" :style="{ width: percentage + '%' }"></div>
  </div>
</template>

<script>
export default {
  name: 'ProgressBar',

  props: {
    percentage: {
      type: Number,
      required: true,
    },
  },
}
</script>

<style lang="scss">
  .progress-bar {
    background-color: #999898;
    width: 100%;
    height: 10px;
    margin-bottom: 6px;
    border-radius: 6px;
    overflow: hidden;

    .progress-bar__bar {
      background-color: #26C400;
      width: 0;
      height: 100%;
      max-width: 100%;
    }
  }
</style>
