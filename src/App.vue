<template>
  <div id="app">
    <app-sidebar />
    <router-view />
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';
import { mapActions } from 'vuex';
import AppSidebar from './layout/AppSidebar';

export default {
  name: 'App',

  components: {
    AppSidebar,
  },

  mounted() {
    this.getDownloads();

    ipcRenderer.on('downloads:added', () => this.getDownloads());
    ipcRenderer.on('downloads:started', () => this.getDownloads());
    ipcRenderer.on('downloads:updated', () => this.getDownloads());
    ipcRenderer.on('downloads:finished', () => this.getDownloads());
  },

  methods: {
    ...mapActions([
      'getDownloads',
    ]),
  }
};
</script>

<style lang="scss">
body {
  margin: 0;
  background-color: #2d2d2d;
  color: #fff;
}

html {
  box-sizing: border-box;
}

*, *:before, *:after {
  box-sizing: inherit;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  display: flex;
}

.main-layout {
  padding: 20px 20px 20px 90px;
}

.card {
  background-color: #201F1F;
  padding: 20px;
}

.btn {
  font-size: 0.75rem;
  padding: 8px 10px;
  text-align: center;
  display: inline-block;
  background: none;
  border: none;
  cursor: pointer;

  &.btn-red {
    border: 1px solid #ec5252;
    color: #ec5252;

    &:hover {
      color: #fff;
      background-color: #ec5252;
    }
  }

  &.btn-blue {
    color: #fff;
    background-color: #084799;

    &:hover {
      background-color: #03377e;
    }
  }

  &.btn-small {
    padding: 4px 10px;
  }
}
</style>
