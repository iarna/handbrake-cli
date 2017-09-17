'use strict'
module.exports = getHandbrakeURL
const downloadsURL = 'https://handbrake.fr/downloads2.php'
const downloadsBase = 'https://handbrake.fr/mirror/'
const ubuntuBaseURL = 'http://ppa.launchpad.net/stebbins/handbrake-releases/ubuntu/'
const ubuntuPackageURL = 'dists/DISTNAME/main/binary-ARCHNAME/Packages.gz'

const fetch = require('./fetch.js')
const url = require('url')
const zlib = require('zlib')
const child_process = require('child_process')

function matchHandbrakeURL (os) {
  return new RegExp(
    '<div class="opsys">[\\n\\s]*' +
      '<h4>' + os + '</h4>[\\n\\s]*' +
      '<b>[^<]+</b><br>[\\n\\s]*' +
      '<a href="([^"]+)">[^<]+</a>')
}

function getHandbrakeURL (os) {
  return fetch(downloadsURL).then(res => {
    return streamToString(res)
  }).then(downloadsHTML => {
    const matched = downloadsHTML.match(matchHandbrakeURL(os.name))
    if (matched) {
      const downloadPage = url.parse(url.resolve(downloadsURL, matched[1]))
      let fileMatch
      if (fileMatch = downloadPage.query.match(/file=([^&]+)/)) {
        return url.resolve(downloadsBase, fileMatch[1])
      } else {
        throw new Error('Could not find download file for ' + os.name + ' in ' + url.resolve(downloadPage))
      }
    } else {
      throw new Error('Could not find a download for ' + os.name)
    }
  })
}

function streamToString (stream) {
  return new Promise((resolve, reject) => {
    let result = ''
    stream.on('data', data => result += data.toString())
    stream.on('error', reject)
    stream.on('end', () => resolve(result))
  })
}
