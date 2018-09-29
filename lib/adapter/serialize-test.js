import test from 'ava'
import soapResponse from '../../tests/helpers/soap1'
import soapResponseWithAttrs from '../../tests/helpers/soap2'
import soapResponseFlightWithoutHead from '../../tests/helpers/soap5'

import serialize from './serialize'

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
  const expected = soapResponse
  const request = {
    method: 'GET',
    data,
    endpoint: {
      uri: 'http://api2.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
      namespace: 'http://example.com/webservices'
    }
  }

  const ret = await serialize(request)

  t.is(ret, expected)
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

  t.is(ret, expected)
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

  t.is(ret, expected)
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

  t.is(ret, expected)
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

  t.is(ret, expected)
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

  t.deepEqual(ret, expected)
})
