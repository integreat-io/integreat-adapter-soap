import test from 'ava'
import soapResponse from '../../tests/helpers/soap1'
import soapResponseWithAttrs from '../../tests/helpers/soap2'
import soapResponseFlightWithoutHead from '../../tests/helpers/soap5'

import serialize from './serialize'

// Setup

const bossIdVendorSoap = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Body>
    <CardNew xmlns="http://example.com/webservices/">
      <customerkey>AD0B2E69-4640-FBF4-9CC7-0C713FDF3B11</customerkey>
      <rfid>04793182CB4884</rfid>
      <installationid>138</installationid>
    </CardNew>
  </soap:Body>
</soap:Envelope>`

// Tests

test('should return soap string from object', async (t) => {
  const data = {
    GetPaymentMethodsResponse: {
      GetPaymentMethodsResult: {
        PaymentMethod: [
          { Id: '1', Name: 'Cash' },
          { Id: '2', Name: 'Invoice' }
        ]
      }
    }
  }
  const endpoint = {
    uri: 'http://api2.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
    namespace: 'http://example.com/webservices'
  }
  const request = {
    method: 'GET',
    data,
    endpoint
  }
  const expected = {
    method: 'GET',
    data: soapResponse,
    endpoint
  }

  const ret = await serialize(request)

  t.deepEqual(ret, expected)
})

test('should use only first element when root element is an array', async (t) => {
  const data = {
    CardNew: [{
      customerkey: 'AD0B2E69-4640-FBF4-9CC7-0C713FDF3B11',
      rfid: '04793182CB4884',
      installationid: '138'
    }]
  }
  const endpoint = {
    uri: 'http://api2.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
    namespace: 'http://example.com/webservices/',
    soap: { version: '1.2' }
  }
  const request = {
    method: 'GET',
    data,
    endpoint
  }
  const expectedData = bossIdVendorSoap

  const ret = await serialize(request)

  t.deepEqual(ret.data, expectedData)
})

test('should set object at path', async (t) => {
  const data = {
    PaymentMethod: [
      { Id: '1', Name: 'Cash' },
      { Id: '2', Name: 'Invoice' }
    ]
  }
  const request = {
    action: 'GET',
    data,
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
      requestPath: 'GetPaymentMethodsResponse.GetPaymentMethodsResult',
      namespace: 'http://example.com/webservices'
    }
  }
  const expected = soapResponse

  const ret = await serialize(request)

  t.is(ret.data, expected)
})

test('should not use response path', async (t) => {
  const data = {
    GetPaymentMethodsResponse: {
      GetPaymentMethodsResult: {
        PaymentMethod: [
          { Id: '1', Name: 'Cash' },
          { Id: '2', Name: 'Invoice' }
        ]
      }
    }
  }
  const request = {
    action: 'GET',
    data,
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
      path: 'Not.To.Be.Used',
      namespace: 'http://example.com/webservices'
    }
  }
  const expected = soapResponse

  const ret = await serialize(request)

  t.is(ret.data, expected)
})

test('should convert attributes', async (t) => {
  const data = {
    PaymentMethod: [
      { '@Id': '1', '@Name': 'Cash' },
      { '@Id': '2', '@Name': 'Invoice' }
    ]
  }
  const request = {
    action: 'GET',
    data,
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
      requestPath: 'GetPaymentMethodsResponse.GetPaymentMethodsResult',
      namespace: 'http://example.com/webservices'
    }
  }
  const expected = soapResponseWithAttrs

  const ret = await serialize(request)

  t.is(ret.data, expected)
})

test('should not include unused namespaces', async (t) => {
  const data = {
    PaymentMethod: [
      { 'Id': '1', 'Name': 'Cash' },
      { 'Id': '2', 'Name': 'Invoice' }
    ]
  }
  const request = {
    action: 'GET',
    data,
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
      requestPath: 'GetPaymentMethodsResponse.GetPaymentMethodsResult',
      namespace: {
        '*': 'http://example.com/webservices',
        xsi: 'http://www.w3.org/2001/XMLSchema-instance',
        xsd: 'http://www.w3.org/2001/XMLSchema'
      }
    }
  }
  const expected = soapResponse

  const ret = await serialize(request)

  t.is(ret.data, expected)
})

test('should handle different namespaces and soap versions', async (t) => {
  const data = {
    'p:itinerary': {
      'p:departure': {
        'p:departing': 'New York',
        'p:arriving': 'Los Angeles',
        'p:departureDate': '2001-12-14',
        'p:seatPreference': 'aisle'
      },
      'p:return': {
        'p:departing': 'Los Angeles',
        'p:arriving': 'New York',
        'p:departureDate': '2001-12-20',
        'p:seatPreference': null
      }
    },
    'q:lodging': {
      'q:preference': 'none'
    }
  }
  const request = {
    action: 'GET',
    data,
    endpoint: {
      uri: 'http://api2.test/FlightItinerary.asmx',
      namespace: {
        p: 'http://travelcompany.example.org/reservation/travel',
        q: 'http://travelcompany.example.org/reservation/hotels'
      },
      soap: {
        prefix: 'env',
        version: '1.2',
        spaces: 1
      }
    }
  }
  const expected = soapResponseFlightWithoutHead

  const ret = await serialize(request)

  t.deepEqual(ret.data, expected)
})
