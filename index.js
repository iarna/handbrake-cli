'use strict'
const path = require('path')
const installData = require('./install-data.js')()
exports.bin = path.resolve(installData.archiveDir, 'HandBrakeCLI' + installData.execExt)
