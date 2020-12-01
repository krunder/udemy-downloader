import merge from 'deepmerge';
import { existsSync, readFileSync, writeFileSync } from 'graceful-fs';
import dot from 'dot-object';

export default class Settings {
  constructor(app, loadFromFile = true) {
    this.fullPath = app.getPath('userData') + '/config.json';
    this.data = {
      auth: {
        token: null,
      },
      download: {
        outputDir: './',
        method: 'hls',
        quality: '1080',
        overwrite: true,
        subtitles: true,
        attachments: true,
      }
    };

    if (loadFromFile) {
      this.load();
    }
  }

  set(key, value) {
    dot.set(key, value, this.data);
  }

  get(key) {
    return dot.pick(key, this.data);
  }

  all() {
    return this.data;
  }

  load() {
    if (existsSync(this.fullPath)) {
      const contents = readFileSync(this.fullPath);
      this.data = merge(this.data, JSON.parse(contents));
    }
  }

  save() {
    const json = JSON.stringify(this.data);
    writeFileSync(this.fullPath, json);
  }

  setData(data) {
    this.data = data;
  }
}
