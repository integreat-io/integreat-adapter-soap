import test from 'ava'
import soapResponse from '../../tests/helpers/soap1'
import soapResponseWithAttrs from '../../tests/helpers/soap2'
import soapResponseFlight from '../../tests/helpers/soap3'

import dataFromXML from './dataFromXML'

test('should convert to js object', (t) => {
  const expected = {
    GetPaymentMethodsResponse: {
      GetPaymentMethodsResult: {
        PaymentMethod: [
          {Id: '1', Name: 'Cash'},
          {Id: '2', Name: 'Invoice'}
        ]
      }
    }
  }

  const data = dataFromXML(soapResponse)

  t.deepEqual(data, expected)
})

test('should convert to js object from path', (t) => {
  const path = 'GetPaymentMethodsResponse.GetPaymentMethodsResult'
  const expected = {
    PaymentMethod: [
      {Id: '1', Name: 'Cash'},
      {Id: '2', Name: 'Invoice'}
    ]
  }

  const data = dataFromXML(soapResponse, path)

  t.deepEqual(data, expected)
})

test('should convert attributes', (t) => {
  const path = 'GetPaymentMethodsResponse.GetPaymentMethodsResult'
  const expected = {
    PaymentMethod: [
      {'@Id': '1', '@Name': 'Cash'},
      {'@Id': '2', '@Name': 'Invoice'}
    ]
  }

  const data = dataFromXML(soapResponseWithAttrs, path)

  t.deepEqual(data, expected)
})

test('should handle different namespaces', (t) => {
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

  const data = dataFromXML(soapResponseFlight)

  t.deepEqual(data, expected)
})
