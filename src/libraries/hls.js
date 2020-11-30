import mkdirp from 'mkdirp';
import { basename } from 'path';
import { rmdirSync } from 'graceful-fs';
import { Parser } from 'm3u8-parser';
import { parse as urlParser } from 'url';
import http from './http';
import PQueue from 'p-queue';
import mergeFiles from 'merge-files';

export default class HLS {
  constructor({
    quality = '1080',
    destination = './',
    filename = 'default.ts',
    maxRetries = 3,
    segmentsDir = 'segments',
  }) {
    this.quality = quality;
    this.destination = destination;
    this.filename = filename;
    this.maxRetries = maxRetries;
    this.segmentsDir = segmentsDir;

    this.queue = new PQueue({
      concurrency: 8,
    });

    this.retries = 0;

    this.dledSeg = 0;
    this.firstSeg = 0;
    this.startSeg = 0;
    this.lastSeg = 0;
    this.segCount = 0;
    this.nextSeg = 0;
    this.appendStream = false;
    this.isStream = false;
  }

  async download(url) {
    await mkdirp(`${this.destination}/${this.segmentsDir}/${this.filename}`);

    const manifest = await this.getM3U8SheetConfig(url);

    // Check resolution
    if (manifest.playlists && manifest.playlists.length > 0) {
      const eligiblePlaylist = manifest.playlists.reduce(
        (accum, playlist) => playlist.attributes.RESOLUTION.height > parseInt(this.quality) ? accum : playlist
      );

      return await this.download(eligiblePlaylist.uri);
    }

    if (!manifest.segments || manifest.segments.length <= 0) {
      console.log('[ERROR] Invalid amount of segments.');
    }

    // Fix none stream data
    if (typeof manifest.mediaSequence !== 'number' || (manifest.mediaSequence === 1 && manifest.endList)) {
      manifest.mediaSequence = 0;
    }

    // Check whether is a stream
    if (manifest.mediaSequence > 0) {
      this.isStream = true;

      // Get stream status
      this.dledSeg = this.nextSeg > 0 ? this.nextSeg - 1 : 0;
      this.firstSeg = manifest.mediaSequence;
      this.startSeg = this.nextSeg > 0 ? this.nextSeg : this.firstSeg;
      this.lastSeg = this.firstSeg + manifest.segments.length;
      this.segCount = this.dledSeg < this.firstSeg ? manifest.segments.length : this.lastSeg - this.dledSeg;

      // Update segments
      manifest.mediaSequence = this.startSeg;
      this.nextSeg = this.lastSeg + 1;
      manifest.segments = manifest.segments.slice(manifest.segments.length - this.segCount);
    }

    await this.queue.addAll(
      manifest.segments.map((segment) => () => this.downloadStream(segment.uri))
    );

    await mergeFiles(
      manifest.segments.map((segment) => this.getSegmentsOutputPath(segment.uri)),
      this.getFullOutputPath()
    );

    rmdirSync(`${this.destination}/${this.segmentsDir}`, { recursive: true });

    return true;
  }

  async getM3U8SheetConfig(url) {
    const data = await http.get(url);

    const parser = new Parser();
    parser.push(data);
    parser.end()

    return parser.manifest;
  }

  async downloadStream(url) {
    try {
      await http.download(url, this.getSegmentsOutputPath(url));

      this.retries = 0;
    } catch (err) {
      if (this.retries < this.maxRetries) {
        this.retries++;

        return await this.downloadStream(url);
      }

      throw err;
    }
  }

  getFullOutputPath() {
    return `${this.destination}/${this.filename}`;
  }

  getSegmentsOutputPath(url) {
    const filename = basename(urlParser(url).pathname);

    return `${this.destination}/${this.segmentsDir}/${this.filename}/${filename}`;
  }
}
