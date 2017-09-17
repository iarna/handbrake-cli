'use strict'
module.exports = downloadHandbrake

const http = require('http')
const https = require('https')
const url = require('url')
const fs = require('fs')
const path = require('path')
const startGauge = require('./gauge')
const TrackerGroup = require('are-we-there-yet').TrackerGroup
const fetch = require('./fetch.js')
const promisify = require('./promisify')
const unlink = promisify(fs.unlink)
const tillFinished = require('./till-finished.js')

function ignoreErrorAnd (p) {
  return p.catch(() => null)
}

function downloadHandbrake (os, downloadsURL) {
  const filename = os.archiveDir + os.archiveExt
  const progress = new TrackerGroup()
  const unlinkProgress = progress.newItem('Unlinking old archive', 1)
  const followRedirects = progress.newItem('Following redirects to archive', 2)
  const downloadGroup = progress.newGroup('Downloading archive...', 17)
  const downloadProgress = downloadGroup.newStream()
  return startGauge(gauge => {
    progress.on('change', function (name, completion, tracker) {
      gauge.pulse()
      gauge.show(name, completion)
    })
    unlinkProgress.completeWork(0)
    return ignoreErrorAnd(unlink(filename)).then(() => {
      unlinkProgress.finish()
      followRedirects.completeWork(0)
      return redirectMaybe(downloadsURL)
    })
  })
  function redirectMaybe (downloadsURL) {
    return fetch(downloadsURL).then(res => {
      if (res.statusCode === 304 || res.statusCode === 302) {
        const newURL = url.resolve(downloadsURL, res.headers.location)
        if (newURL === downloadsURL) throw new Error('Redirect loop detected')
        return redirectMaybe(newURL)
      } else {
        followRedirects.finish()
        if (res.headers['content-length']) {
          downloadProgress.addWork(res.headers['content-length'])
        }
        return tillFinished(res.pipe(downloadProgress).pipe(fs.createWriteStream(filename)))
      }
    })
  }
}
