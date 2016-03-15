'use strict'
var fs = require('fs')
var path = require('path')
var detectHandbrakeOS = require('./detect-handbrake-os.js')
var getHandbrakeURL = require('./get-handbrake-url.js')
var downloadHandbrake = require('./download-handbrake.js')
var extractHandbrake = require('./extract-handbrake.js')

var os

detectHandbrakeOS(ifOk(thenGetHandbrakeURL))

function thenGetHandbrakeURL (detected) {
  os = detected
  getHandbrakeURL(os, ifOk(thenDownloadHandbrake)) 
}

function thenDownloadHandbrake (url) {
  downloadHandbrake(os, url, ifOk(thenExtractHandbrake))
}

function thenExtractHandbrake () {
  extractHandbrake(os, ifOk(thenWriteIndex))
}

function thenWriteIndex () {
  try {
    // try captures JSON throws
    fs.writeFile(path.resolve(__dirname, 'index.json'), JSON.stringify(os, null, 2), ifOk(finish))
  } catch (ex) {
    errorOut(ex)
  }
}

function finish () {
  console.log('ok')
}

function ifOk (cb) {
  return function (err) {
    if (err) errorOut(err)
    cb.apply(null, Array.prototype.slice.call(arguments, 1))
  }
}

function errorOut (err) {
  console.error('Could find handbrake to install:')
  console.error('    ' + err.message)
  process.exit(1)
}

function extractHandbrake (url, cb) {
}
