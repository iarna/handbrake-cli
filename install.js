'use strict'
const path = require('path')
const installData = require('./install-data.js')
const detectHandbrakeOS = require('./detect-handbrake-os.js')
const getHandbrakeURL = require('./get-handbrake-url.js')
const downloadHandbrake = require('./download-handbrake.js')
const extractHandbrake = require('./extract-handbrake.js')

let info = installData()
detectHandbrakeOS().then(detected => {
  if (info.platform !== detected.platform) {
    info = detected
  }
  return getHandbrakeURL(info)
}).then(url => {
  if (info.url === url) throw 'skip'
  info.url = url
  return downloadHandbrake(info, url)
}).then(() => {
  return extractHandbrake(info)
}).then(() => {
  return installData.save(info)
}).catch(err => {
  if (err !== 'skip') throw err
}).catch(err => {
  console.error('Could find handbrake to install:')
  console.error('    ' + err.message)
  process.exit(1)
})
