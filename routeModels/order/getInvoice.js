const pdfDocument = require('pdfkit');
const Order = require('./Order');
const path = require('path');
const fs = require('fs');

function generateHr(doc, y) {
  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

function formatCurrency(cents) {
  return '$' + (cents / 100).toFixed(2);
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + '/' + month + '/' + day;
}

function generateTableRow(doc, y, item, unitCost, lineTotal) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(unitCost, 280, y, {width: 90, align: 'right'})
    .text(lineTotal, 0, y, {align: 'right'});
}

getInvoice = (req, res, next) => {
  const {orderId} = req.params;

  Order.findById(orderId)
    .populate('products')
    .then((order) => {
      if (!order) {
        req.flash('error', 'You dont have any order placed');
        res.redirect('/index');
      }

      if (order.user.toString() != req.user.id.toString()) {
        res.redirect('/index');
        return;
      }
      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);
      const image = path.join(__dirname, './logo.png');
      const pdfDoc = new pdfDocument({size: 'A4', margin: 50});

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'inline; filename= "' + invoiceName + '"'
      );

      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc
        .image(image, 50, 45, {width: 50})
        .fillColor('#444444')
        .fontSize(20)
        .text('ACME Inc.', 110, 57)
        .fontSize(10)
        .text('ACME Inc.', 200, 50, {align: 'right'})
        .text('123 Main Street', 200, 65, {align: 'right'})
        .text('New York, NY, 10025', 200, 80, {align: 'right'})
        .moveDown();

      pdfDoc.fillColor('#444444').fontSize(20).text('Invoice', 50, 160);

      generateHr(pdfDoc, 185);
      const customerInformationTop = 200;
      let {totalCost} = order;
      pdfDoc
        .fontSize(10)
        .text('Invoice Number:', 50, customerInformationTop)
        .font('Helvetica-Bold')
        .text('invoice.invoice_nr', 150, customerInformationTop)
        .font('Helvetica')
        .text('Invoice Date:', 50, customerInformationTop + 15)
        .text(formatDate(new Date()), 150, customerInformationTop + 15)
        .text('Balance Due:', 50, customerInformationTop + 30)
        .text(formatCurrency(totalCost), 150, customerInformationTop + 30)

        .font('Helvetica-Bold')
        .text('invoice.shipping.name', 300, customerInformationTop)
        .font('Helvetica')
        .text('invoice.shipping.address', 300, customerInformationTop + 15)
        // .text(
        //   invoice.shipping.city +
        //     ", " +
        //     invoice.shipping.state +
        //     ", " +
        //     invoice.shipping.country,
        //   300,
        //   customerInformationTop + 30
        // )
        .moveDown();

      generateHr(pdfDoc, 185);

      let i;
      const invoiceTableTop = 330;

      pdfDoc.font('Helvetica-Bold');
      generateTableRow(
        pdfDoc,
        invoiceTableTop,
        'Item',
        'Unit Cost',
        'Line Total'
      );
      generateHr(pdfDoc, invoiceTableTop + 20);
      pdfDoc.font('Helvetica');

      // order.products.forEach((product) => {
      //   const position = invoiceTableTop + (i + 1) * 30;
      //   i++;
      //   generateTableRow(
      //     pdfDoc,
      //     position,
      //     'product.title',
      //     'product.deliveryCharge',
      //     'product.price'
      //   );

      //   generateHr(pdfDoc, position + 20);
      // });

      // let { totalCost } = order;
      order.products.forEach((product) => {
        // totalCost = totalCost + prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            product.title +
              ' -- ' +
              product.price +
              '+' +
              product.deliveryCharge
          );
      });
      pdfDoc.text('-----------');
      pdfDoc.fontSize(20).text('Total Price $' + totalCost);
      pdfDoc.end();
    })

    .catch((err) => {
      console.log(err);
      req.flash('error', 'Can not get your invoice right now');
      res.redirect('/index');
    });
};

module.exports = getInvoice;
