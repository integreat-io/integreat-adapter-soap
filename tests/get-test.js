import test from 'ava'
import nock from 'nock'
import soapResponse from './helpers/soap1'
import soapResponseInvoices from './helpers/soap4'

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
  const data = await adapter.normalize(response.data, request)

  t.truthy(response)
  t.is(response.status, 'ok')
  t.deepEqual(data, expectedData)
})

test('should get soap response from soap request', async (t) => {
  // const requestBody = `<?xml version='1.0' ?>
  // <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  //   <soap:Body>
  //     <GetPaymentMethods xmlns="http://api1.test/webservices" />
  //   </soap:Body>
  // </soap:Envelope>`
  nock('http://api1.test')
    .post('/Economy/InvoiceOrder/V001/InvoiceService.asmx')
    .reply(200, soapResponseInvoices)
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
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
    {InvoiceId: '341101', CustomerId: '18003', CustomerName: 'Client Inc', OrderStatus: 'Invoiced'},
    {InvoiceId: '341102', CustomerId: '18003', CustomerName: 'Client Inc', OrderStatus: 'ForInvoicing'}
  ]

  const requestData = await adapter.serialize(request.data, request)
  const response = await adapter.send({...request, data: requestData})
  const data = await adapter.normalize(response.data, request)

  t.truthy(response)
  t.is(response.status, 'ok')
  t.deepEqual(data, expectedData)
})
