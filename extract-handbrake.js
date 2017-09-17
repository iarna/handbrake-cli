'use strict'
module.exports = extractHandbrake

const path = require('path')
const fs = require('fs')
const unzip = require('unzip')
const system = require('./exec').system
const capture = require('./exec').capture
const promisify = require('./promisify.js')
const rimraf = promisify(require('rimraf'))
const tillFinished = require('./till-finished.js')
const startGauge = require('./gauge')
const TrackerGroup = require('are-we-there-yet').TrackerGroup

function extractHandbrake (os) {
  const filename = path.resolve(__dirname, 'archive' + os.archiveExt)
  const outputdir = path.resolve(__dirname, 'archive')
  const progress = new TrackerGroup()
  const unlinkProgress = progress.newItem('Unlinking outputdir', 1)
  const extractGroup = progress.newGroup('Extracting archive...', 17)

  return startGauge(gauge => {
    progress.on('change', function (name, completion, tracker) {
      gauge.pulse()
      gauge.show(name, completion)
    })
    unlinkProgress.completeWork(0)
    return rimraf(outputdir).then(() => {
      unlinkProgress.finish()
      if (os.extractWith === 'zip-extractor') {
        const extractProgress = extractGroup.newStream()
        return tillFinished(fs.createReadStream(filename).pipe(extractProgress).pipe(unzip.Extract({ path: outputdir })))
      } else if (os.extractWith === 'dmg-extractor') {
        const extractProgress = extractGroup.newItem('Extracting archive...', 3)
        let dev
        return capture('hdiutil', ['attach', filename]).then(result => {
          extractProgress.completeWork(1)
          const stdout = result.stdout
          const matched = stdout.match(/^([/]dev[/]disk\S+)\s+Apple_HFS\s+(\S+)/m)
          if (!matched) throw new Error("Couldn't match hdiutil output: " + stdout)
          dev = matched[1]
          const inputdir = matched[2]
          return system('cp', ['-a', inputdir, outputdir])
        }).then(() => {
          extractProgress.completeWork(1)
          return system('hdiutil', ['detach', dev])
        })
      } else {
        throw new Error('Unknown extractor: ' + os.extractWith)
      }
    })
  })
}

