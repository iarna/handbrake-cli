'use strict'
const os = require('os')
const prefix = os.type() === 'Windows_NT' ? '' : '.'
const name = prefix + 'handebrake-cli-install-data.json'
const filename = os.homedir() + '/' + name
const archive = prefix + 'handebrake-cli-install-data'
const archivename = os.homedir() + '/' + archive
const fs = require('fs')

module.exports = load
module.exports.save = save

function load () {
  let info
  try {
    info = JSON.parse(fs.readFileSync(filename))
  } catch (ex) {
    info = {}
  }
  info.filename = filename
  info.archiveDir = archivename
  return info
}

function save (data) {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2))
}