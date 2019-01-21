const debug = require('debug')('great:adapter:soap')

/**
 * Send the given data to the endpoint, and return status and data.
 * This is used for both retrieving and sending data, and Integreat will
 * handle the preparation of the sent and the retrieved data.
 *
 * If an auth strategy is provided, authorization is attempted if not already
 * authenticated, and a successfull authentication is required before sending
 * the data with auth headers from the auth strategy.
 *
 * @param {Object} request - Request with uri/endpoint, data, auth, method, and headers
 * @returns {Object} Object with status and data
 */
async function send (got, { endpoint, data: requestData, auth, params = {} }) {
  if (!endpoint) {
    return { status: 'noaction', error: 'No endpoint' }
  }
  const { uri, soap = {}, retries = 0 } = endpoint
  const { version } = soap
  const method = (requestData) ? 'post' : 'get'

  debug('Sending to %s %s: %o', method, uri, requestData)

  const options = {
    body: requestData,
    method,
    retry: retries,
    headers: {
      'Content-Type': (version === '1.2') ? 'application/soap+xml' : 'text/xml'
    }
  }

  if (auth) {
    Object.assign(options.headers, auth)
  }

  if (params.dryrun) {
    return {
      status: 'dryrun',
      data: {
        uri,
        method,
        body: options.body,
        headers: options.headers
      }
    }
  }

  const { body: data } = await got(uri, options)

  debug('Got data %o', data)

  return {
    status: 'ok',
    data
  }
}

module.exports = send
