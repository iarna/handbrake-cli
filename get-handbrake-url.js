'use strict'
module.exports = getHandbrakeURL
var downloadsURL = 'https://handbrake.fr/downloads2.php'
var downloadsBase = 'https://handbrake.fr/mirror/'
var ubuntuBaseURL = 'http://ppa.launchpad.net/stebbins/handbrake-releases/ubuntu/'
var ubuntuPackageURL = 'dists/DISTNAME/main/binary-ARCHNAME/Packages.gz'

var fetch = require('./fetch.js')
var url = require('url')
var zlib = require('zlib')
var child_process = require('child_process')
var detectHandbrakeOS = require('./detect-handbrake-os')
var Tracker = require('are-we-there-yet').Tracker
var Gauge = require('gauge')

function matchHandbrakeURL (os) {
  return new RegExp(
    '<div class="opsys">[\\n\\s]*' +
      '<h4>' + os + '</h4>[\\n\\s]*' +
      '<b>[^<]+</b><br>[\\n\\s]*' +
      '<a href="([^"]+)">[^<]+</a>')
}

function getHandbrakeURL (os, cb) {
  if (os.name === 'Ubuntu') return getUbuntuHandbrakeURL(os, cb)
  var progress = new Tracker('Get Handbrake download URL...', 2)
  var gauge = new Gauge(process.stderr)
  gauge.enable()
  function ret () {
    gauge.disable()
    cb.apply(null, arguments)
  }
  progress.on('change', function (name, completion, tracker) {
    gauge.pulse()
    gauge.show(name, completion)
  })

  fetch(downloadsURL).on('response', function (res) {
    progress.completeWork(1)
    streamToString(res, function (err, downloadsHTML) {
      progress.finish()
      gauge.disable()
      if (err) return ret(err)
      var matched = downloadsHTML.match(matchHandbrakeURL(os.name))
      if (matched) {
        const downloadPage = url.parse(url.resolve(downloadsURL, matched[1]))
        let fileMatch
        if (fileMatch = downloadPage.query.match(/file=([^&]+)/)) {
          ret(null, url.resolve(downloadsBase, fileMatch[1]))
        } else {
          ret(new Error('Could not find download file for ' + os.name + ' in ' + url.resolve(downloadPage)))
        }
      } else {
        ret(new Error('Could not find a download for ' + os.name))
      }
    })
  })
}

function getUbuntuHandbrakeURL (os, cb) {
  var packagesURL = url.resolve(ubuntuBaseURL, ubuntuPackageURL
    .replace(/DISTNAME/, os.release)
    .replace(/ARCHNAME/, os.architecture))
  fetch(packagesURL).on('response', function (res) {
    streamToString(res.pipe(zlib.createUnzip()), function (err, packages) {
      if (err) return cb(err)
      var seenCLI = false
      var lines = packages.split(/\n/)
      var filename
      for (var ii=0; ii<lines.length; ++ii) {
        var line = lines[ii]
        if (/^Package: handbrake-cli$/.test(line)) seenCLI = true
        if (!seenCLI) continue
        if (line.trim() === '') break
        var matched
        if (matched = line.match(/^Filename: (\S+)$/)) {
          filename = matched[1]
          break
        }
      }
      if (!filename) return cb(new Error('Could not find handbrake-cli in Packages.gz'))
      cb(null, url.resolve(ubuntuBaseURL, filename))
    })
  })
}

function streamToString (stream, cb) {
  var result = ''
  var error
  stream.on('data', function (data) {
    result += data.toString()
  })
  stream.on('error', function (err) {
    cb(error = err)
  })
  stream.on('end', function () {
    if (!error) cb(null, result)
  })
}
