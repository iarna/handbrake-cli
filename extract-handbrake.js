'use strict'
module.exports = extractHandbrake

var path = require('path')
var fs = require('fs')
var execFile = require('child_process').execFile
var unzip = require('unzip')
var system = require('./exec').system
var capture = require('./exec').capture
var pipe = require('./exec').pipe

function extractHandbrake (os, cb) {
  var filename = path.resolve(__dirname, 'archive' + os.archiveExt)
  var outputdir = path.resolve(__dirname, 'archive')

  function thenOk () {
    return cb.apply(null, [null].concat(Array.prototype.slice.call(arguments)))
  }
  function ifErrFailElse (next) {
    return function (err) {
      if (err) return cb(err)
      return next.apply(null, Array.prototype.slice.call(arguments,1))
    }
  }

  system('rm', ['-rf', outputdir], ifErrFailElse(function () {
    if (os.extractWith === 'zip-extractor') {
      fs.createReadStream(filename).pipe(unzip.Extract({ path: outputdir }))
        .on('error', cb)
        .on('finish', thenOk)
    } else if (os.extractWith === 'dmg-extractor') {
      capture('hdiutil', ['attach', filename], ifErrFailElse(function (stdout, stderr) {
        var matched = stdout.match(/^([/]dev[/]disk\S+)\s+Apple_HFS\s+(\S+)/m)
        var dev = matched[1]
        var inputdir = matched[2]
        cpInputToOutput()
        function cpInputToOutput () {
          system('cp', ['-a', inputdir, outputdir], unmountDmg)
        }
        function unmountDmg () {
          system('hdiutil', ['detach', dev], cb)
        }
      }))
    } else if (os.extractWith === 'deb-extractor') {
      fs.mkdir(outputdir, ifErrFailElse(function () {
        pipe([
          ['ar', '-p', filename, 'data.tar.bz2'],
          ['tar', 'x', '--strip-components', 3, '-C', outputdir]
        ], cb)
      }))
    } else {
      throw new Error('Unknown extractor: ' + os.extractWith)
    }
  }))
}

