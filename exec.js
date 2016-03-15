'use strict'
exports.system = system
exports.capture = capture
exports.pipe = pipe

var execFile = require('child_process').execFile

function system (cmd, args, cb) {
  execAndEscape(cmd, args, {stdio: 'inherit'}, cb)
}

function capture (cmd, args, cb) {
  execAndEscape(cmd, args, {}, cb)
}

function pipe (cmds, cb) {
  var escaped = cmds.map(function (cmdArgs) {
    return escapeArgs(cmdArgs).join(' ')
  }).join(' | ')
  return execFile('/bin/sh', ['-c', escaped], cb)
}

function escapeArgs (args) {
  return args.map(function (str) {
    return "'" + str.toString().replace(/'/g, "'\''") + "'"
  })
}

function execAndEscape (cmd, args, opts, cb) {
  var escaped = escapeArgs([cmd].concat(args))
  return execFile('/bin/sh',['-c', escaped.join(' ')], opts, cb)
}
