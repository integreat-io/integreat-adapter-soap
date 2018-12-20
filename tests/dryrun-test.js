import test from 'ava'
import nock from 'nock'

import adapter from '..'

// Helpers

const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetInvoices xmlns="http://api1.test/webservices">
      <searchParams>
        <CustomerIds>
          <int>18003</int>
        </CustomerIds>
        <InvoiceIds>
          <int>341101</int>
          <int>341102</int>
        </InvoiceIds>
      </searchParams>
      <invoiceReturnProperties>
        <string>InvoiceId</string>
        <string>CustomerId</string>
        <string>CustomerName</string>
        <string>OrderStatus</string>
      </invoiceReturnProperties>
    </GetInvoices>
  </soap:Body>
</soap:Envelope>`

test.after.always(() => {
  nock.restore()
})

// Tests

test('should return soap request without calling service', async (t) => {
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
      path: 'GetInvoicesResponse.GetInvoicesResult.InvoiceOrder',
      namespace: 'http://api1.test/webservices'
    },
    params: { dryrun: true },
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
  const expected = {
    uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
    method: 'post',
    body: soapBody,
    headers: { 'Content-Type': 'text/xml' }
  }

  const serializedRequest = await adapter.serialize(request)
  const response = await adapter.send(serializedRequest)
  const ret = await adapter.normalize(response, request)

  t.truthy(ret)
  t.is(ret.status, 'dryrun')
  t.deepEqual(ret.data, expected)
})
