export default {
  /**
   * Set downloads array.
   *
   * @param {Object} state
   * @param {Array} downloads
   */
  setDownloads(state, { downloads }) {
    state.downloads = downloads;
  },

  /**
   * Remove download from list.
   *
   * @param {Object} state
   * @param {Number} courseId
   */
  removeDownload(state, courseId) {
    const index = state.downloads.findIndex(download => download.course.id === courseId);

    if (index !== -1) {
      state.downloads.splice(index, 1);
    }
  },
};
