'use strict'
const Gauge = require('gauge')
const gauge = new Gauge(process.stderr)

module.exports = setup

function setup (init) {
  return new Promise(resolve => {
    gauge.enable()
    resolve(init(gauge))
  }).then(value => {
    gauge.disable()
    return value
  }, err => {
    gauge.disable()
    throw err
  })
}
