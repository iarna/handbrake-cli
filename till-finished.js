'use strict'

module.exports = tillFinished

function tillFinished (stream) {
  return new Promise((resolve, reject) => {
    stream.on('error', reject)
    stream.on('finish', resolve)
  })
}
