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
async function send (got, {endpoint, data: requestData, auth}) {
  const {uri} = endpoint

  const options = {
    body: requestData,
    method: (requestData) ? 'post' : 'get',
    headers: {
      'Content-Type': 'application/soap+xml'
    }
  }

  if (auth) {
    options.headers = auth
  }

  const {body: data} = await got(uri, options)

  return {
    status: 'ok',
    data
  }
}

module.exports = send
