const { mergeDeepRight } = require('ramda')

function prepareEndpoint (endpointOptions, serviceOptions) {
  return (endpointOptions)
    ? mergeDeepRight(serviceOptions, endpointOptions)
    : serviceOptions || {}
}

module.exports = prepareEndpoint
