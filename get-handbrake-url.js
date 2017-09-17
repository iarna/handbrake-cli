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
const Tracker = require('are-we-there-yet').Tracker
const gaugeFor = require('./gauge.js')

function matchHandbrakeURL (os) {
  return new RegExp(
    '<div class="opsys">[\\n\\s]*' +
      '<h4>' + os + '</h4>[\\n\\s]*' +
      '<b>[^<]+</b><br>[\\n\\s]*' +
      '<a href="([^"]+)">[^<]+</a>')
}

function getHandbrakeURL (os) {
  return gaugeFor(gauge => {
    if (os.name === 'Ubuntu') return getUbuntuHandbrakeURL(os)

    const progress = new Tracker('Get Handbrake download URL...', 2)
    progress.on('change', function (name, completion, tracker) {
      gauge.pulse()
      gauge.show(name, completion)
    })

    return fetch(downloadsURL).then(res => {
      progress.completeWork(1)
      return streamToString(res)
    }).then(downloadsHTML => {
      progress.finish()
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
  })
}

function getUbuntuHandbrakeURL (os, cb) {
  const packagesURL = url.resolve(ubuntuBaseURL, ubuntuPackageURL
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

function streamToString (stream) {
  return new Promise((resolve, reject) => {
    let result = ''
    stream.on('data', data => result += data.toString())
    stream.on('error', reject)
    stream.on('end', () => resolve(result))
  })
}
