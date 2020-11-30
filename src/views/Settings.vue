<template>
  <div class="settings main-layout">
    <div class="card">
      <div class="form-group">
        <label for="outputDir">Output Directory</label>
        <input id="outputDir" type="text" class="form-control" v-model="formData.download.outputDir" @click.prevent="showDirectoryDialog" />
      </div>

      <div class="form-group">
        <label for="method">Download Method</label>
        <select id="method" class="form-control" v-model="formData.download.method">
          <option value="hls">HTTP Live Streaming (HLS)</option>
          <option value="standard">Standard (1080p usually unavailable)</option>
        </select>
      </div>

      <div class="form-group">
        <label for="quality">Quality</label>
        <select id="quality" class="form-control" v-model="formData.download.quality">
          <option value="Highest">Highest</option>
          <option value="1080">1080p</option>
          <option value="720">720p</option>
          <option value="480">480p</option>
          <option value="360">360p</option>
          <option value="144">144p</option>
          <option value="Lowest">Lowest</option>
        </select>
      </div>

      <div class="form-group checkbox">
        <input type="checkbox" id="subtitles" name="subtitles" v-model="formData.download.subtitles" />
        <label for="subtitles">Subtitles</label>
      </div>

      <div class="form-group checkbox">
        <input type="checkbox" id="attachments" name="attachments" v-model="formData.download.attachments" />
        <label for="attachments">Attachments</label>
      </div>

      <button type="submit" class="btn btn-blue" @click.prevent="saveChanges">Save Changes</button>
    </div>
  </div>
</template>

<script>
import { remote } from 'electron';

export default {
  name: 'Settings',

  data() {
    return {
      formData: this.$settings.all(),
    };
  },

  methods: {
    saveChanges() {
      this.$settings.setData(this.formData);
      this.$settings.save();
    },

    async showDirectoryDialog() {
      if (this.displayDialog) {
        return;
      }

      this.displayDialog = true;

      const paths = await remote.dialog.showOpenDialogSync({
        defaultPath: this.formData.download.outputDir,
        properties: ['openDirectory', 'createDirectory'],
      });

      if (paths && paths.length > 0) {
        this.formData.download.outputDir = paths[0];
      }

      this.displayDialog = false;
    },
  },
}
</script>

<style lang="scss">
.settings {
  width: 100%;
}

.form-group {
  margin-bottom: 20px;

  .form-control {
    width: 100%;
    padding: 10px;
    background: #2d2d2d;
    box-shadow: none;
    border-radius: 0;
    border: 0;
    color: #fff;

    &:focus, &:active {
      border: none;
      box-shadow: none;
    }
  }

  label {
    display: inline-block;
    margin-bottom: 10px;
  }

  &.checkbox {
    input {
      margin-right: 10px;
    }

    label {
      margin-bottom: 0;
    }
  }
}
</style>
