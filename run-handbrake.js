#!/usr/bin/env node
'use strict'
const handbrake = require('./index.js')
var spawn = require('child_process').spawn
spawn(handbrake.bin, process.argv.slice(2), {stdio: 'inherit'})
