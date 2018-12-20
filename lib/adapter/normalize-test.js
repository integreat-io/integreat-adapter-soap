import test from 'ava'
import soapResponse from '../../tests/helpers/soap1'
import soapResponseWithAttrs from '../../tests/helpers/soap2'
import soapResponseFlight from '../../tests/helpers/soap3'

import normalize from './normalize'

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

test('should handle different namespaces', async (t) => {
  const response = { data: soapResponseFlight, status: 'ok' }
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api2.test/FlightItinerary.asmx'
    }
  }
  const expected = {
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
