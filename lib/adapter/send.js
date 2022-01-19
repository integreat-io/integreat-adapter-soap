const debug = require('debug')('great:adapter:soap')

const createErrorReponse = (uri, statusCode, statusMessage, data) => {
  const response = {
    status: 'error',
    error: `Error from '${uri}': ${statusMessage}`,
    ...(data && { data }),
  }

  switch (statusCode) {
    case 400:
      response.status = 'badrequest'
      break
    case 404:
      response.status = 'notfound'
      response.error = `Could not find '${uri}': ${statusMessage}`
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

const getContentType = (version) =>
  version === '1.2'
    ? 'application/soap+xml;charset=utf-8'
    : 'text/xml;charset=utf-8'

const setSoapAction = (soapAction, version, headers) =>
  soapAction
    ? version === '1.2'
      ? {
          ...headers,
          'Content-Type': `${headers['Content-Type']};action="${soapAction}"`,
        }
      : {
          ...headers,
          SOAPAction: soapAction,
        }
    : headers

const createOptions = (
  requestData,
  { soap: { version = '1.1' } = {}, retries = 0, timeout = 120000 },
  { soapAction },
  auth
) => ({
  body: requestData,
  method: version === '1.1' || requestData ? 'POST' : 'GET',
  retry: { retries },
  timeout,
  headers: setSoapAction(soapAction, version, {
    'Content-Type': getContentType(version),
    ...auth,
  }),
  throwHttpErrors: false,
})

const logRequest = (request, logger) => {
  const message = `Sending ${request.method} ${request.uri}`
  debug('%s: %o', message, request.body)
  if (logger) {
    logger.info(message, request)
  }
}

const logResponse = (response, { uri, method }, logger) => {
  const { status } = response
  const message =
    status === 'ok'
      ? `Success from ${method} ${uri}`
      : `Error from ${method} ${uri}: ${status}`
  debug('%s: %o', message, response)
  if (logger) {
    if (status === 'ok') {
      logger.info(message, response)
    } else {
      logger.error(message, response)
    }
  }
}

async function sendRequest(uri, options, got) {
  try {
    const { body: data, statusCode, statusMessage } = await got(uri, options)
    if (statusCode >= 200 && statusCode < 400) {
      return {
        status: 'ok',
        data,
      }
    } else {
      return createErrorReponse(uri, statusCode, statusMessage, data)
    }
  } catch (error) {
    return createErrorReponse(uri, error.statusCode, error.message)
  }
}

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
async function send(
  got,
  { endpoint, data: requestData, auth, params = {} },
  logger = undefined
) {
  if (!endpoint) {
    return { status: 'noaction', error: 'No endpoint' }
  }
  const { uri } = endpoint
  const options = createOptions(requestData, endpoint, params, auth)

  const request = {
    uri,
    method: options.method,
    body: options.body,
    headers: options.headers,
    retries: options.retry.retries,
  }

  if (params.dryrun) {
    return {
      status: 'dryrun',
      data: request,
    }
  }

  logRequest(request, logger)
  const response = await sendRequest(uri, options, got)
  logResponse(response, request, logger)

  return response
}

module.exports = send
