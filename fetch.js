'use strict'
module.exports = fetch

const http = require('http')
const https = require('https')
const url = require('url')
const extend = Object.assign || require('util')._extend

function fetch (href) {
  return new Promise((resolve, reject) => {
    const toRequest = url.parse(href)
    const proto = toRequest.protocol === 'https:' ? https : http
    const req = proto.get({
      hostname: toRequest.hostname,
      port: toRequest.port || (proto === https ? 443 : 80),
      path: toRequest.path,
      agent: false
    })
    req.on('error', reject)
    req.on('response', resolve)
  })
}
