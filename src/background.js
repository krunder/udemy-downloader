'use strict'

import { app, protocol, BrowserWindow, ipcMain, session } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import HLS from './libraries/hls';
import http from './libraries/http';
import Settings from './plugins/settings';
import PQueue from 'p-queue';
const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

const queue = new PQueue({
  concurrency: 1,
});

global.downloads = [];
global.settings = new Settings(app);

function openLoginWindow(parent) {
  const dimensions = parent.getSize();

  const loginWin = new BrowserWindow({
    width: dimensions[0] - 100,
    height: dimensions[1] - 100,
    modal: true,
    webPreferences: {
      contextIsolation: false,
    },
    parent,
  });

  session.defaultSession.webRequest.onBeforeSendHeaders(
    {
      urls: ['*://*.udemy.com/*'],
    },
    (request, callback) => {
      if (request.requestHeaders.Authorization) {
        settings.set('auth.token', request.requestHeaders.Authorization.split(' ')[1]);
        settings.save();

        loginWin.destroy();
        session.defaultSession.clearStorageData();
        session.defaultSession.webRequest.onBeforeSendHeaders(
          {
            urls: ['*://*.udemy.com/*'],
          },
          (request, callback) => callback({ requestHeaders: request.requestHeaders })
        );
      }

      callback({ requestHeaders: request.requestHeaders });
    },
  );

  loginWin.loadURL('https://www.udemy.com/join/login-popup');
}

let win;

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 700,
    height: 600,
    title: 'Udemy Downloader',
    resizable: false,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: true,//process.env.ELECTRON_NODE_INTEGRATION,
      enableRemoteModule: true,
      contextIsolation: false,
      webSecurity: false,
    }
  })

  win.removeMenu()

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  if (!settings.get('auth.token')) {
    openLoginWindow(win);
  }
}

function addCourseToDownloads(course, downloads) {
  const courseDownload = {
    file: {
      bytesCompleted: 0,
      totalBytes: 0,
    },
    overall: {
      filesCompleted: 0,
      totalFiles: downloads.length,
    },
    inProgress: false, // Automatically mark as in progress if no more downloads in queue
    items: downloads,
    course,
  };

  global.downloads = [...global.downloads, courseDownload];

  return courseDownload;
}

async function downloadItem(download) {
  if (download.type === 'hls') {
    const downloader = new HLS({
      quality: download.quality,
      destination: download.destination,
      filename: download.filename,
      maxRetries: 3,
    });

    return await downloader.download(download.url);
  }

  return await http.download(download.url, `${download.destination}/${download.filename}`);
}

ipcMain.handle('downloads:add-course', (evt, course, downloads) => {
  const courseDownload = addCourseToDownloads(course, downloads);

  win.webContents.send('downloads:added', global.downloads);

  queue.add(async () => {
    courseDownload.inProgress = true;

    win.webContents.send('downloads:started', courseDownload.course.id);

    const courseQueue = new PQueue({
      concurrency: 1,
    })

    await courseQueue.addAll(
      courseDownload.items.map(download => async () => {
        await downloadItem(download);

        courseDownload.overall.filesCompleted++;

        if (courseDownload.overall.filesCompleted < courseDownload.items.length) {
          win.webContents.send('downloads:updated', courseDownload);
        }
      })
    );

    global.downloads.splice(
      global.downloads.findIndex(download => download.course.id === courseDownload.course.id),
      1
    );

    win.webContents.send('downloads:finished', global.downloads);
  });

  return courseDownload;
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
