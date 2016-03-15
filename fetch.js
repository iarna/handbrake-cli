'use strict'
module.exports = fetch

var http = require('http')
var https = require('https')
var url = require('url')
var extend = Object.assign || require('util')._extend

function fetch (urlToGet, options) {
  var toRequest = url.parse(urlToGet)
  var proto = toRequest.protocol === 'https:' ? https : http
  if (!options) options = {}
  extend(options, {
    hostname: toRequest.hostname,
    port: toRequest.port || (proto === https ? 443 : 80),
    path: toRequest.path,
    agent: false
  })
  return proto.get(options)
}