'use strict'
module.exports = detectHandbrakeOS

var path = require('path')
var capture = require('./exec').capture

function detectHandbrakeOS (cb) {
  switch (process.platform) {
  case 'darwin':
    process.nextTick(cb, null, MacOS())
    break
  case 'win32':
    process.nextTick(cb, null, Windows())
    break
  // This is how you detect which distibution a linux machine is running, incidentally
  // I wrote it before realizing the Ubuntu binaries would be a pain in the butt.
  case 'linux':
    capture('lsb_release', ['-ics'], function (err, stdout, stderr) {
      if (err) cb()
      var lines = stdout.trim().split(/\n/)
      var dist = lines[0]
      var codename = lines[1]
      if (dist !== 'Ubuntu') {
        return cb(new Error('Unsupported distribution of Linux: ' + stdout.trim()))
      }
      capture('dpkg', ['--print-architecture'], function (err, stdout, stderr) {
        if (err) cb()
        var arch = stdout.trim()
        cb(null, Ubuntu(codename, arch))
      })
    })
  default:
    process.nextTick(cb, new Error('Unsupported platform: ' + process.platform))
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

function Ubuntu (code, arch) {
  return {
    name: 'Ubuntu',
    release: code,
    architecture: arch,
    platform: process.platform,
    execExt: '',
    archiveExt: '.deb',
    extractWith: 'deb-extractor'
  }
}
