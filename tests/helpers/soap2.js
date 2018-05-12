module.exports = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetPaymentMethodsResponse xmlns="http://example.com/webservices">
      <GetPaymentMethodsResult>
        <PaymentMethod Id="1" Name="Cash"/>
        <PaymentMethod Id="2" Name="Invoice"/>
      </GetPaymentMethodsResult>
    </GetPaymentMethodsResponse>
  </soap:Body>
</soap:Envelope>`
