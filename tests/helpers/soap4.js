module.exports = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <soap:Body>
    <GetInvoicesResponse xmlns="http://api1.test/webservices">
      <GetInvoicesResult>
        <InvoiceOrder>
          <InvoiceId>341101</InvoiceId>
          <CustomerId>18003</CustomerId>
          <CustomerName>Client Inc</CustomerName>
          <OrderStatus>Invoiced</OrderStatus>
          <IncludeVAT xsi:nil="true" />
        </InvoiceOrder>
        <InvoiceOrder>
          <InvoiceId>341102</InvoiceId>
          <CustomerId>18003</CustomerId>
          <CustomerName>Client Inc</CustomerName>
          <OrderStatus>ForInvoicing</OrderStatus>
          <IncludeVAT>true</IncludeVAT>
        </InvoiceOrder>
      </GetInvoicesResult>
    </GetInvoicesResponse>
  </soap:Body>
</soap:Envelope>`
