'use strict'
exports.system = system
exports.capture = capture

const execFile = require('cross-exec-file')
const promisify = require('./promisify.js')
const which = promisify(require('which'))

function system (cmd, args) {
  return which(cmd).then(cmd => execFile(cmd, args, {stdio: 'inherit'}))
}

function capture (cmd, args) {
  return which(cmd).then(cmd => execFile(cmd, args, {}))
}
