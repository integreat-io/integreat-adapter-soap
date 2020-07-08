import test from 'ava'
import sinon from 'sinon'
import soapResponse from '../../tests/helpers/soap1'

import send from './send'

test('should get soap response', async (t) => {
  const got = sinon.stub().resolves({ body: soapResponse })
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx'
    }
  }

  const response = await send(got, request)

  t.truthy(response)
  t.is(response.status, 'ok')
  t.deepEqual(response.data, soapResponse)
})

test('should use post when no data for 1.1', async (t) => {
  const got = sinon.stub().resolves({ body: soapResponse })
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx'
    }
  }

  await send(got, request)

  t.is(got.callCount, 1)
  t.is(got.args[0][0], 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx')
  t.deepEqual(got.args[0][1].method, 'POST')
})

test('should use get when no data for 1.2', async (t) => {
  const got = sinon.stub().resolves({ body: soapResponse })
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
      soap: { version: '1.2' }
    }
  }

  await send(got, request)

  t.is(got.callCount, 1)
  t.is(got.args[0][0], 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx')
  t.deepEqual(got.args[0][1].method, 'GET')
})

test('should include SOAPAction header', async (t) => {
  const got = sinon.stub().resolves({ body: soapResponse })
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx'
    },
    params: {
      soapAction: 'http://tempuri.org/HelloSimple'
    }
  }
  const expectedOptions = {
    body: undefined,
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml;charset=utf-8',
      SOAPAction: 'http://tempuri.org/HelloSimple'
    },
    retry: { retries: 0 },
    timeout: 120000
  }

  await send(got, request)

  t.deepEqual(got.args[0][1], expectedOptions)
})

test('should call got with soap 1.2 content-type', async (t) => {
  const got = sinon.stub().resolves({ body: soapResponse })
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
      soap: { version: '1.2' }
    },
    params: {
      soapAction: 'http://tempuri.org/HelloSimple'
    }
  }
  const expectedHeaders = {
    'Content-Type': 'application/soap+xml;charset=utf-8;action="http://tempuri.org/HelloSimple"'
  }

  await send(got, request)

  t.is(got.callCount, 1)
  t.is(got.args[0][0], 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx')
  t.deepEqual(got.args[0][1].headers, expectedHeaders)
})

test('should call got with auth headers', async (t) => {
  const got = sinon.stub().resolves({ body: soapResponse })
  const auth = {
    Authorization: 'Bearer t0k3n'
  }
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx'
    },
    auth
  }
  const expectedHeaders = {
    Authorization: 'Bearer t0k3n',
    'Content-Type': 'text/xml;charset=utf-8'
  }

  await send(got, request)

  t.is(got.callCount, 1)
  t.is(got.args[0][0], 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx')
  t.deepEqual(got.args[0][1].headers, expectedHeaders)
})

test('should call got with retries', async (t) => {
  const got = sinon.stub().resolves({ body: soapResponse })
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
      retries: 2
    }
  }

  await send(got, request)

  t.is(got.callCount, 1)
  t.is(got.args[0][0], 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx')
  t.is(got.args[0][1].retry.retries, 2)
})

test('should call got with timeout', async (t) => {
  const got = sinon.stub().resolves({ body: soapResponse })
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
      timeout: 30000
    }
  }

  await send(got, request)

  t.is(got.callCount, 1)
  t.is(got.args[0][1].timeout, 30000)
})

test('should post data', async (t) => {
  const got = sinon.stub().resolves({ body: soapResponse })
  const request = {
    action: 'GET',
    data: '<?xml version="1.0" encoding="utf-8"?><soap:Envelope></soap:Envelope>',
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx'
    }
  }
  const expectedOptions = {
    body: '<?xml version="1.0" encoding="utf-8"?><soap:Envelope></soap:Envelope>',
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml;charset=utf-8'
    },
    retry: { retries: 0 },
    timeout: 120000
  }

  await send(got, request)

  t.is(got.callCount, 1)
  t.is(got.args[0][0], 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx')
  t.deepEqual(got.args[0][1], expectedOptions)
})

test('should return noaction when no endpoint', async (t) => {
  const got = sinon.stub().resolves({ body: soapResponse })
  const request = {
    action: 'GET',
    endpoint: null
  }

  const response = await send(got, request)

  t.truthy(response)
  t.is(response.status, 'noaction')
  t.is(typeof response.error, 'string')
  t.falsy(response.data)
})

test('should return request props on dry-run', async (t) => {
  const got = sinon.stub().resolves({ body: soapResponse })
  const request = {
    action: 'GET',
    data: '<?xml version="1.0" encoding="utf-8"?><soap:Envelope></soap:Envelope>',
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx'
    },
    params: {
      dryrun: true
    }
  }
  const expectedData = {
    uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
    method: 'POST',
    body: '<?xml version="1.0" encoding="utf-8"?><soap:Envelope></soap:Envelope>',
    headers: {
      'Content-Type': 'text/xml;charset=utf-8'
    },
    retries: 0
  }

  const ret = await send(got, request)

  t.is(ret.status, 'dryrun', ret.error)
  t.deepEqual(ret.data, expectedData)
})

test('should return error when got throws', async (t) => {
  const error = new Error('Request failed')
  const got = sinon.stub().rejects(error)
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx'
    }
  }

  const response = await send(got, request)

  t.truthy(response)
  t.is(response.status, 'error')
  t.is(typeof response.error, 'string')
})

test('should return timeout error', async (t) => {
  const error = new Error('Timeout!')
  error.statusCode = 408
  const got = sinon.stub().rejects(error)
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx'
    }
  }

  const response = await send(got, request)

  t.truthy(response)
  t.is(response.status, 'timeout')
  t.is(typeof response.error, 'string')
})

test('should return not found error', async (t) => {
  const error = new Error('Not found')
  error.statusCode = 404
  const got = sinon.stub().rejects(error)
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx'
    }
  }

  const response = await send(got, request)

  t.truthy(response)
  t.is(response.status, 'notfound')
  t.is(typeof response.error, 'string')
})

test('should return badrequest error', async (t) => {
  const error = new Error('Bad request!')
  error.statusCode = 400
  const got = sinon.stub().rejects(error)
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx'
    }
  }

  const response = await send(got, request)

  t.truthy(response)
  t.is(response.status, 'badrequest')
  t.is(typeof response.error, 'string')
})

test('should return noaccess error on forbidden', async (t) => {
  const error = new Error('Forbidden')
  error.statusCode = 403
  const got = sinon.stub().rejects(error)
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx'
    }
  }

  const response = await send(got, request)

  t.truthy(response)
  t.is(response.status, 'noaccess')
  t.is(typeof response.error, 'string')
})

test('should return noaccess error on unauthorized', async (t) => {
  const error = new Error('Unauthorized')
  error.statusCode = 401
  const got = sinon.stub().rejects(error)
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx'
    }
  }

  const response = await send(got, request)

  t.truthy(response)
  t.is(response.status, 'noaccess')
  t.is(typeof response.error, 'string')
})
