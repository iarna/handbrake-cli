'use strict'
module.exports = promisify

function promisify (fn) {
  return function () {
    const args = [].slice.call(arguments)
    return new Promise((resolve, reject) => {
      fn.apply(null, args.concat([function (err, value) {
        if (err) return reject(err)
        if (arguments.length === 2) return resolve(value)
        return resolve([].slice.call(arguments, 1))
      }]))
    })
  }
}
