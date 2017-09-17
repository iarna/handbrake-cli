'use strict'
module.exports = detectHandbrakeOS

function detectHandbrakeOS (cb) {
  switch (process.platform) {
  case 'darwin':
    return Promise.resolve(MacOS())
  case 'win32':
    return Promise.resolve(Windows())
  default:
    return Promise.reject(new Error('Unsupported platform: ' + process.platform))
  }
}

function MacOS () {
  return {
    name: 'Mac OS',
    platform: process.platform,
    execExt: '',
    archiveExt: '.dmg',
    extractWith: 'dmg-extractor'
  }
}

function Windows () {
  return {
    name: 'Windows',
    platform: process.platform,
    execExt: '.exe',
    archiveExt: '.zip',
    extractWith: 'zip-extractor'
  }
}
