import test from 'ava'
import nock from 'nock'
import soapResponse from './helpers/soap1'
import soapResponseInvoices from './helpers/soap4'

import adapter from '..'

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
      { Id: '1', Name: 'Cash' },
      { Id: '2', Name: 'Invoice' }
    ]
  }

  const response = await adapter.send(request)
  const { data } = await adapter.normalize(response, request)

  t.truthy(response)
  t.is(response.status, 'ok')
  t.deepEqual(data, expectedData)
})

test('should get soap response from soap request', async (t) => {
  const requestBody = /<\?xml\s+version="1\.0"\s+encoding="utf-8"\?>\s*<soap:Envelope\s+xmlns:soap="http:\/\/schemas\.xmlsoap\.org\/soap\/envelope\/">\s*<soap:Body>\s*<GetInvoices\s+xmlns="http:\/\/api1\.test\/webservices">\s*<searchParams>\s*<CustomerIds>\s*<int>18003<\/int>\s*<\/CustomerIds>\s*<InvoiceIds>\s*<int>341101<\/int>\s*<int>341102<\/int>\s*<\/InvoiceIds>\s*<\/searchParams>\s*<invoiceReturnProperties>\s*<string>InvoiceId<\/string>\s*<string>CustomerId<\/string>\s*<string>CustomerName<\/string>\s*<string>OrderStatus<\/string>\s*<\/invoiceReturnProperties>\s*<\/GetInvoices>\s*<\/soap:Body>\s*<\/soap:Envelope>/
  nock('http://api2.test')
    .post('/Economy/InvoiceOrder/V001/InvoiceService.asmx', requestBody)
    .reply(200, soapResponseInvoices)
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api2.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
      path: 'GetInvoicesResponse.GetInvoicesResult.InvoiceOrder',
      namespace: 'http://api1.test/webservices'
    },
    data: {
      GetInvoices: {
        searchParams: {
          CustomerIds: {
            int: 18003
          },
          InvoiceIds: {
            int: [341101, 341102]
          }
        },
        invoiceReturnProperties: {
          string: ['InvoiceId', 'CustomerId', 'CustomerName', 'OrderStatus']
        }
      }
    }
  }
  const expectedData = [
    { InvoiceId: '341101', CustomerId: '18003', CustomerName: 'Client Inc', OrderStatus: 'Invoiced', IncludeVAT: null },
    { InvoiceId: '341102', CustomerId: '18003', CustomerName: 'Client Inc', OrderStatus: 'ForInvoicing', IncludeVAT: 'true' }
  ]

  const serializedRequest = await adapter.serialize(request)
  const response = await adapter.send(serializedRequest)
  const { data } = await adapter.normalize(response, request)

  t.truthy(response)
  t.is(response.status, 'ok')
  t.deepEqual(data, expectedData)
})

test('should not retry as default', async (t) => {
  const scope = nock('http://api3.test')
    .get('/Economy/InvoiceOrder/V001/InvoiceService.asmx')
    .once().reply(408)
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api3.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
      path: 'GetPaymentMethodsResponse.GetPaymentMethodsResult'
    }
  }

  const response = await adapter.send(request)

  t.truthy(response)
  t.is(response.status, 'timeout')
  t.true(scope.isDone())
})
