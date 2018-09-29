import test from 'ava'

import prepareEndpoint from './prepareEndpoint'

test('should return endpointOptions', (t) => {
  const endpointOptions = { uri: 'http://soap.com/endpoint' }

  const ret = prepareEndpoint(endpointOptions)

  t.deepEqual(ret, endpointOptions)
})

test('should merge with serviceOptions', (t) => {
  const endpointOptions = { uri: 'http://soap.com/endpoint' }
  const serviceOptions = {
    uri: 'http://othersoap.com/', soap: { version: '1.2' }
  }
  const expected = {
    uri: 'http://soap.com/endpoint', soap: { version: '1.2' }
  }

  const ret = prepareEndpoint(endpointOptions, serviceOptions)

  t.deepEqual(ret, expected)
})

test('should use serviceOptions when no endpointOptions', (t) => {
  const serviceOptions = {
    uri: 'http://othersoap.com/', soap: { version: '1.2' }
  }

  const ret = prepareEndpoint(undefined, serviceOptions)

  t.deepEqual(ret, serviceOptions)
})

test('should always return object', (t) => {
  const ret = prepareEndpoint(null)

  t.deepEqual(ret, {})
})
