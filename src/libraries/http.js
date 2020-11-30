import { createWriteStream } from 'graceful-fs';
import { dirname } from 'path';
import mkdirp from 'mkdirp';
import axios from 'axios';

export default {
  async get(url) {
    const { data } = await axios.get(url, {
      responseType: 'text',
    });

    return data;
  },

  async download(url, path) {
    await mkdirp(dirname(path));

    const stream = createWriteStream(path, {
      flags: 'a',
    });

    try {
      const response = await axios.get(url, {
        responseType: 'stream',
      });

      response.data.pipe(stream);

      return new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', (err) => {
          stream.end();

          return reject(err);
        });
      });
    } catch (err) {
      stream.end();

      throw err;
    }
  },
};

