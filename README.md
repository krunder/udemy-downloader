# Udemy Downloader

## Description
An easy-to-use client GUI for downloading Udemy courses along with their attachments.

## Usage
**Latest version:** v1.0.0
1. Go to https://github.com/krunder/udemy-downloader/releases
2. Download portable or setup on whichever version you prefer
3. Load the application
4. On first load, you will be presented with the Udemy login page in a separate window. Fill out the form and login (Your Udemy username & password are **NEVER** stored at any point)
4. Click **Settings** in the sidebar
5. Update the output directory to any location on your PC
6. Click **Save Changes**
7. Click **Courses**
8. Click the download icon on the course you wish to download
9. The application should prepare the course data and automatically start downloading the course. Only **ONE** course gets downloaded at a time with the others that have been prepared placed into a queue.

## Supported Operating Systems
* Windows 10

## Installation
```
npm install
npm run electron:serve (Development)
npm run electron:build (Production)
```
