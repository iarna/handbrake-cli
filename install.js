'use strict'
const path = require('path')
const installData = require('./install-data.js')
const detectHandbrakeOS = require('./detect-handbrake-os.js')

let info = installData()
detectHandbrakeOS().then(detected => {
  if (info.platform !== detected.platform) {
    Object.assign(info, detected)
  }
  const getHandbrakeURL = require('./get-handbrake-url.js')
  return getHandbrakeURL(info)
}).then(url => {
  if (info.url === url) throw 'skip'
  info.url = url
  const downloadHandbrake = require('./download-handbrake.js')
  return downloadHandbrake(info, url)
}).then(() => {
  const extractHandbrake = require('./extract-handbrake.js')
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
