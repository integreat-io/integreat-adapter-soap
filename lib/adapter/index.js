const got = require('got')
const send = require('./send')
const normalize = require('./normalize')

module.exports = {
  prepareEndpoint: (endpointOptions) => endpointOptions,
  send: async (request) => send(got, request),
  normalize,
  serialize: async (data) => data
}
