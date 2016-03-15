'use strict'
module.exports = downloadHandbrake

var http = require('http')
var https = require('https')
var url = require('url')
var fs = require('fs')
var path = require('path')
var TrackerGroup = require('are-we-there-yet').TrackerGroup
var Gauge = require('gauge')
var fetch = require('./fetch.js')

function downloadHandbrake (os, downloadsURL, cb) {
  var filename = path.resolve(__dirname, 'archive' + os.archiveExt)
  var progress = new TrackerGroup()
  var gauge = new Gauge(process.stderr)
  gauge.enable()
  progress.on('change', function (name, completion, tracker) {
    gauge.pulse()
    gauge.show(name, completion)
  })
  var unlinkProgress = progress.newItem('Unlinking old archive', 1)
  var followRedirects = progress.newItem('Following redirects to archive', 2)
  var downloadGroup = progress.newGroup('Downloading archive...', 17)
  var downloadProgress = downloadGroup.newStream()
  unlinkProgress.completeWork(0)
  function ret () {
    gauge.disable()
    cb.apply(null, arguments)
  }
  fs.unlink(filename, function () {
    unlinkProgress.finish()
    followRedirects.completeWork(0)
    redirectMaybe(downloadsURL)
    function redirectMaybe (downloadsURL) {
      fetch(downloadsURL).on('response', function (res) {
        if (res.statusCode === 304 || res.statusCode === 302) {
          var newURL = url.resolve(downloadsURL, res.headers.location)
          if (newURL === downloadsURL) return ret(new Error('Redirect loop detected'))
          return redirectMaybe(newURL)
        } else {
          followRedirects.finish()
          if (res.headers['content-length']) {
            downloadProgress.addWork(res.headers['content-length'])
          }
          res.pipe(downloadProgress).pipe(fs.createWriteStream(filename)).on('finish', function () {
            ret()
          })
        }
      })
    }
  })
}
