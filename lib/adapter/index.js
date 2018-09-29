const got = require('got')
const send = require('./send')
const normalize = require('./normalize')
const serialize = require('./serialize')
const prepareEndpoint = require('./prepareEndpoint')

module.exports = {
  authentication: 'asHttpHeaders',
  prepareEndpoint,
  send: async (request) => send(got, request),
  normalize,
  serialize
}
