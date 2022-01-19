import test from 'ava'
import sinon from 'sinon'
import nock from 'nock'
import soapResponseInvoices from './helpers/soap4'

import soap from '..'

// Setup

const requestBody =
  '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetInvoices xmlns="http://api1.test/webservices"><searchParams><CustomerIds><int>18003</int></CustomerIds><InvoiceIds><int>341101</int><int>341102</int></InvoiceIds></searchParams><invoiceReturnProperties><string>InvoiceId</string><string>CustomerId</string><string>CustomerName</string><string>OrderStatus</string></invoiceReturnProperties></GetInvoices></soap:Body></soap:Envelope>/'

// Tests

test('should log request and response', async (t) => {
  const logger = {
    info: sinon.stub(),
    error: sinon.stub(),
  }
  const adapter = soap(logger)
  nock('http://api1.test')
    .post('/Economy/InvoiceOrder/V001/InvoiceService.asmx')
    .reply(200, soapResponseInvoices)
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
      path: 'GetInvoicesResponse.GetInvoicesResult.InvoiceOrder',
      namespace: 'http://api1.test/webservices',
    },
    data: requestBody,
  }
  const expectedPreMessage =
    'Sending POST http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx'
  const expectedPreMeta = {
    method: 'POST',
    uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
    body: requestBody,
    headers: { 'Content-Type': 'text/xml;charset=utf-8' },
    retries: 0,
  }
  const expectedPostMessage =
    'Success from POST http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx'
  const expectedPostMeta = {
    status: 'ok',
    data: soapResponseInvoices,
  }

  await adapter.send(request)

  t.is(logger.info.callCount, 2)
  t.is(logger.error.callCount, 0)
  t.is(logger.info.args[0][0], expectedPreMessage)
  t.deepEqual(logger.info.args[0][1], expectedPreMeta)
  t.is(logger.info.args[1][0], expectedPostMessage)
  t.deepEqual(logger.info.args[1][1], expectedPostMeta)

  nock.restore()
})

test('should log error response', async (t) => {
  const logger = {
    info: sinon.stub(),
    error: sinon.stub(),
  }
  const adapter = soap(logger)
  nock('http://api2.test')
    .post('/Economy/InvoiceOrder/V001/InvoiceService.asmx')
    .reply(404)
  const request = {
    action: 'GET',
    endpoint: {
      uri: 'http://api2.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
      path: 'GetInvoicesResponse.GetInvoicesResult.InvoiceOrder',
      namespace: 'http://api1.test/webservices',
    },
    data: requestBody,
  }
  const expectedPostMessage =
    'Error from POST http://api2.test/Economy/InvoiceOrder/V001/InvoiceService.asmx: notfound'
  const expectedPostMeta = {
    status: 'notfound',
    error:
      "Could not find 'http://api2.test/Economy/InvoiceOrder/V001/InvoiceService.asmx': Not Found",
  }

  await adapter.send(request)

  t.is(logger.info.callCount, 1)
  t.is(logger.error.callCount, 1)
  t.is(logger.error.args[0][0], expectedPostMessage)
  t.deepEqual(logger.error.args[0][1], expectedPostMeta)

  nock.restore()
})
