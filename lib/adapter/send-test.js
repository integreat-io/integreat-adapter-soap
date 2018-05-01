import test from 'ava'
import sinon from 'sinon'
import soapResponse from '../../tests/helpers/soap1'

import send from './send'

test('should exist', (t) => {
  t.is(typeof send, 'function')
})

test('should get soap response and return object', async (t) => {
  const got = sinon.stub().resolves({body: soapResponse})
  const expectedData = {
    GetPaymentMethodsResponse: {
      GetPaymentMethodsResult: {
        PaymentMethod: [
          {Id: '1', Name: 'Cash'},
          {Id: '2', Name: 'Invoice'}
        ]
      }
    }
  }
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx'
    }
  }

  const response = await send(got)(request)

  t.truthy(response)
  t.is(response.status, 'ok')
  t.deepEqual(response.data, expectedData)
})

test('should call got with uri', async (t) => {
  const got = sinon.stub().resolves({body: soapResponse})
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx'
    }
  }

  await send(got)(request)

  t.is(got.callCount, 1)
  t.is(got.args[0][0], 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx')
})
