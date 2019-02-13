const debug = require('debug')('great:adapter:soap')

const createErrorReponse = (error, uri) => {
  const response = {
    status: (error.statusCode === 408) ? 'timeout' : 'error',
    error: `Error from '${uri}': ${error.toString()}`
  }

  switch (error.statusCode) {
    case 400:
      response.status = 'badrequest'
      break
    case 404:
      response.status = 'notfound'
      response.error = `Could not find '${uri}': ${error.toString()}`
      break
    case 408:
      response.status = 'timeout'
      break
    case 401:
    case 403:
      response.status = 'noaccess'
  }

  return response
}

const getContentType = (version) => (version === '1.2')
  ? 'application/soap+xml;charset=utf-8'
  : 'text/xml;charset=utf-8'

const setSoapAction = (soapAction, version, headers) => (soapAction)
  ? (version === '1.2')
    ? ({
      ...headers,
      'Content-Type': `${headers['Content-Type']};action="${soapAction}"`
    })
    : ({
      ...headers,
      SOAPAction: soapAction
    })
  : headers

const createOptions = (requestData, { soap: { version = '1.1' } = {}, retries = 0 }, { soapAction }, auth) => ({
  body: requestData,
  method: (version === '1.1' || requestData) ? 'post' : 'get',
  retry: { retries },
  headers: setSoapAction(soapAction, version, {
    'Content-Type': getContentType(version),
    ...auth
  })
})

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
  const { uri } = endpoint
  const options = createOptions(requestData, endpoint, params, auth)

  debug('Sending to %s %s: %o', options.method, uri, requestData)

  if (params.dryrun) {
    return {
      status: 'dryrun',
      data: {
        uri,
        method: options.method,
        body: options.body,
        headers: options.headers
      }
    }
  }

  try {
    const { body: data } = await got(uri, options)

    debug('Got data %o', data)

    return {
      status: 'ok',
      data
    }
  } catch (error) {
    return createErrorReponse(error, uri)
  }
}

module.exports = send
