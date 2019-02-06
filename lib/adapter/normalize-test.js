import test from 'ava'
import soapResponse from '../../tests/helpers/soap1'
import soapResponseWithAttrs from '../../tests/helpers/soap2'
import soapResponseFlight from '../../tests/helpers/soap3'
import soapResponseWithNull from '../../tests/helpers/soap4'

import normalize from './normalize'

// Setup

const soapWithHeader = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Header>
    <addr:Action soap:mustUnderstand="1" xmlns:addr="http://schemas.microsoft.com/ws/2005/05/addressing/none">http://tempuri.org/IBossNetService/ContainerFull</addr:Action>
  </soap:Header>
  <soap:Body>
    <CardNew xmlns="http://example.com/webservices/">
      <customerkey>AD0B2E69-4640-FBF4-9CC7-0C713FDF3B12</customerkey>
      <rfid>04793182CB4884</rfid>
      <installationid>158</installationid>
    </CardNew>
  </soap:Body>
</soap:Envelope>`

// Tests

test('should return object from soap string', async (t) => {
  const response = { status: 'ok', data: soapResponse }
  const endpoint = {
    uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx'
  }
  const request = {
    action: 'GET',
    endpoint
  }
  const expected = {
    status: 'ok',
    data: {
      GetPaymentMethodsResponse: {
        GetPaymentMethodsResult: {
          PaymentMethod: [
            { Id: '1', Name: 'Cash' },
            { Id: '2', Name: 'Invoice' }
          ]
        }
      }
    }
  }

  const ret = await normalize(response, request)

  t.deepEqual(ret, expected)
})

test('should return object at path', async (t) => {
  const response = { data: soapResponse, status: 'ok' }
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
      path: 'GetPaymentMethodsResponse.GetPaymentMethodsResult'
    }
  }
  const expected = {
    PaymentMethod: [
      { Id: '1', Name: 'Cash' },
      { Id: '2', Name: 'Invoice' }
    ]
  }

  const ret = await normalize(response, request)

  t.deepEqual(ret.data, expected)
})

test('should return array at path', async (t) => {
  const response = { data: soapResponse, status: 'ok' }
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
      path: 'GetPaymentMethodsResponse.GetPaymentMethodsResult.PaymentMethod'
    }
  }
  const expected = [
    { Id: '1', Name: 'Cash' },
    { Id: '2', Name: 'Invoice' }
  ]

  const ret = await normalize(response, request)

  t.deepEqual(ret.data, expected)
})

test('should convert attributes', async (t) => {
  const response = { data: soapResponseWithAttrs, status: 'ok' }
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
      path: 'GetPaymentMethodsResponse.GetPaymentMethodsResult'
    }
  }
  const expected = {
    PaymentMethod: [
      { '@Id': '1', '@Name': 'Cash' },
      { '@Id': '2', '@Name': 'Invoice' }
    ]
  }

  const ret = await normalize(response, request)

  t.deepEqual(ret.data, expected)
})

test('should return xsi:nil as null', async (t) => {
  const response = { status: 'ok', data: soapResponseWithNull }
  const endpoint = {
    uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx'
  }
  const request = {
    action: 'GET',
    endpoint
  }

  const ret = await normalize(response, request)

  t.is(ret.status, 'ok')
  const orders = ret.data.GetInvoicesResponse.GetInvoicesResult.InvoiceOrder
  t.is(orders[0].IncludeVAT, null)
  t.is(orders[1].IncludeVAT, 'true')
})

test('should handle different namespaces', async (t) => {
  const response = { data: soapResponseFlight, status: 'ok' }
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api2.test/FlightItinerary.asmx'
    }
  }
  const expected = {
    'env:Header': {
      'm:reservation': {
        '@env:role': 'http://www.w3.org/2003/05/soap-envelope/role/next',
        '@env:mustUnderstand': 'true',
        'm:reference': 'uuid:093a2da1-q345-739r-ba5d-pqff98fe8j7d',
        'm:dateAndTime': '2001-11-29T13:20:00.000-05:00'
      },
      'n:passenger': {
        '@env:role': 'http://www.w3.org/2003/05/soap-envelope/role/next',
        '@env:mustUnderstand': 'true',
        'n:name': 'Åke Jógvan Øyvind'
      }
    },
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

  const ret = await normalize(response, request)

  t.deepEqual(ret.data, expected)
})

test('should return soap with Header', async (t) => {
  const response = { data: soapWithHeader, status: 'ok' }
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api2.test/HeaderSoap.asmx'
    }
  }
  const expected = {
    'soap:Header': {
      'addr:Action': {
        '@soap:mustUnderstand': '1',
        _text: 'http://tempuri.org/IBossNetService/ContainerFull'
      }
    },
    CardNew: {
      customerkey: 'AD0B2E69-4640-FBF4-9CC7-0C713FDF3B12',
      rfid: '04793182CB4884',
      installationid: '158'
    }
  }

  const ret = await normalize(response, request)

  t.deepEqual(ret.data, expected)
})

test('should return undefined when not a soap document', async (t) => {
  const response = { data: '', status: 'ok' }
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api2.test/HeaderSoap.asmx'
    }
  }

  const ret = await normalize(response, request)

  t.is(typeof ret.data, 'undefined')
})
