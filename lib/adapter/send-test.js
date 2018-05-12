import test from 'ava'
import sinon from 'sinon'
import soapResponse from '../../tests/helpers/soap1'

import send from './send'

test('should exist', (t) => {
  t.is(typeof send, 'function')
})

test('should get soap response', async (t) => {
  const got = sinon.stub().resolves({body: soapResponse})
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

test('should call got with uri', async (t) => {
  const got = sinon.stub().resolves({body: soapResponse})
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx'
    }
  }
  const expectedOptions = {
    body: undefined,
    method: 'get'
  }

  await send(got, request)

  t.is(got.callCount, 1)
  t.is(got.args[0][0], 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx')
  t.deepEqual(got.args[0][1], expectedOptions)
})

test('should post data', async (t) => {
  const got = sinon.stub().resolves({body: soapResponse})
  const request = {
    action: 'GET',
    data: '<?xml version="1.0" encoding="utf-8"?><soap:Envelope></soap:Envelope>',
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx'
    }
  }
  const expectedOptions = {
    body: '<?xml version="1.0" encoding="utf-8"?><soap:Envelope></soap:Envelope>',
    method: 'post'
  }

  await send(got, request)

  t.is(got.callCount, 1)
  t.is(got.args[0][0], 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx')
  t.deepEqual(got.args[0][1], expectedOptions)
})
