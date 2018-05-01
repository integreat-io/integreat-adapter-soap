const got = require('got')
const send = require('./send')

module.exports = {
  send: send(got)
}
