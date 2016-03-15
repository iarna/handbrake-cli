'use strict'
const path = require('path')
const info = require('./index.json')

exports.bin = path.resolve(__dirname, 'archive', 'HandBrakeCLI' + info.execExt)
