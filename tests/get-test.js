import test from 'ava'
import nock from 'nock'
import soapResponse from './helpers/soap1'

import soap from '..'
const {adapter} = soap

// Helpers

test.after.always(() => {
  nock.restore()
})

// Tests

test('should get soap response and return js object', async (t) => {
  nock('http://api1.test')
    .get('/Economy/InvoiceOrder/V001/InvoiceService.asmx')
    .reply(200, soapResponse)
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
      path: 'GetPaymentMethodsResponse.GetPaymentMethodsResult'
    }
  }
  const expectedData = {
    PaymentMethod: [
      {Id: '1', Name: 'Cash'},
      {Id: '2', Name: 'Invoice'}
    ]
  }

  const response = await adapter.send(request)

  t.truthy(response)
  t.is(response.status, 'ok')
  t.deepEqual(response.data, expectedData)
})
