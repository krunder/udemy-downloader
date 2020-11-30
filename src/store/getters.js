export default {
  /**
   * Get all completed downloads from state.
   *
   * @param {Object} state
   * @returns Array
   */
  completedDownloads(state) {
    return state.downloads.filter(download => download.completed);
  },

  /**
   * Get whether a download is currently in progress.
   *
   * @param {Object} state
   * @returns {Boolean}
   */
  hasDownloadInProgress(state) {
    return state.downloads.findIndex(download => download.inProgress) !== -1;
  },
};
