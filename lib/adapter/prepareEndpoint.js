const { mergeDeepRight } = require('ramda')

function prepareEndpoint (endpointOptions, serviceOptions) {
  return mergeDeepRight(serviceOptions, endpointOptions)
}

module.exports = prepareEndpoint
