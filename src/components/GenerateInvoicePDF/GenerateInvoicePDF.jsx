import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";

const GenerateInvoicePDF = async (
  id,
  date,
  payment_method,
  amount,
  OrderItems,
  currencySymbol
) => {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // Add a page with A4 dimensions
  const page = pdfDoc.addPage([595.276, 841.89]); // A4 in points
  const { width, height } = page.getSize();

  // Load fonts
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Colors
  const primaryColor = rgb(0.1, 0.1, 0.1);
  const secondaryColor = rgb(0.5, 0.5, 0.5);
  const accentColor = rgb(0.2, 0.4, 0.8);

  // Helper function to format currency
  const formatCurrency = (symbol, value) => {
    const formattedValue =
      typeof value === "number"
        ? value.toFixed(2)
        : parseFloat(value).toFixed(2);
    if (symbol === "₹") {

      return `Rs. ${formattedValue}`;
    }

    return `${symbol}${formattedValue}`;
  };

  // Helper function for text drawing
  const drawText = (text, x, y, options = {}) => {
    const {
      fontSize = 12,
      color = primaryColor,
      font = helvetica,
      align = "left",
    } = options;

    let xPosition = x;
    if (align === "right") {
      const measureText = text.replace("₹", "Rs.");
      const textWidth = font.widthOfTextAtSize(measureText, fontSize);
      xPosition = width - x - textWidth;
    }

    const safeText = text.replace("₹", "Rs.");

    page.drawText(safeText, {
      x: xPosition,
      y,
      size: fontSize,
      font,
      color,
    });
  };

  // Draw header
  drawText("INVOICE", 50, height - 50, {
    fontSize: 28,
    font: helveticaBold,
    color: accentColor,
  });

  // Invoice details box
  const boxY = height - 120;
  page.drawRectangle({
    x: 50,
    y: boxY,
    width: width - 100,
    height: 60,
    borderColor: rgb(0.9, 0.9, 0.9),
    borderWidth: 1,
  });

  // Invoice information
  drawText(`Invoice No: #${id}`, 60, boxY + 40, { fontSize: 10 });
  drawText(`Date: ${date}`, 60, boxY + 20, { fontSize: 10 });
  drawText(`Payment Method: ${payment_method.toUpperCase()}`, 60, boxY + 5, {
    fontSize: 10,
  });

  // Calculate totals from OrderItems
  let subtotal = 0;
  let totalTax = 0;
  let deliveryCharge = parseFloat(OrderItems[0]?.delivery_charge || 0);
  let deliveryTip = parseFloat(OrderItems[0]?.delivery_tip || 0);
  let discount = parseFloat(OrderItems[0]?.discount || 0);

  // Items table header
  const tableY = boxY - 40;

  const columns = [
    { x: 50, width: 60, title: "Qty" },
    { x: 110, width: 250, title: "Item Description" },
    { x: 360, width: 90, title: "Unit Price" },
    { x: 450, width: 95, title: "Amount" },
  ];

  // Draw table header
  page.drawRectangle({
    x: 50,
    y: tableY,
    width: width - 100,
    height: 25,
    color: rgb(0.95, 0.95, 0.95),
  });

  columns.forEach((col) => {
    drawText(col.title, col.x, tableY + 8, {
      fontSize: 10,
      font: helveticaBold,
    });
  });

  // Initial tax calculation flag
  let taxCalculated = false;

  // Draw items
  let currentY = tableY - 25;
  OrderItems.forEach((item, index) => {
    if (index % 2 === 0) {
      page.drawRectangle({
        x: 50,
        y: currentY,
        width: width - 100,
        height: 25,
        color: rgb(0.98, 0.98, 0.98),
      });
    }

    const price = parseFloat(item.price);
    const quantity = parseInt(item.quantity, 10);
    const itemSubtotal = price * quantity; // Calculate subtotal based on price and quantity
    const taxPercent = parseFloat(item.tax_percent);
    const itemTax = parseFloat(item.tax_amount); // Use the provided tax_amount directly

    subtotal += itemSubtotal;

    // Only add tax for the first item
    if (!taxCalculated) {
      totalTax += itemTax;
      taxCalculated = true; // Set flag to avoid adding tax from other items
    }

    drawText(quantity.toString(), columns[0].x + 5, currentY + 8, {
      fontSize: 10,
    });
    drawText(item.product_name, columns[1].x + 5, currentY + 8, {
      fontSize: 10,
    });
    drawText(
      formatCurrency(currencySymbol, price),
      columns[2].x + 5,
      currentY + 8,
      { fontSize: 10 }
    );
    drawText(
      formatCurrency(currencySymbol, itemSubtotal),
      columns[3].x + 5,
      currentY + 8,
      { fontSize: 10 }
    );

    currentY -= 25;
  });

  // Draw totals
  currentY -= 20;
  page.drawLine({
    start: { x: 50, y: currentY },
    end: { x: width - 50, y: currentY },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9),
  });

  // Calculate final total
  const finalTotal =
    subtotal + totalTax + deliveryCharge + deliveryTip - discount;

  // Draw all amounts
  currentY -= 20;
  
  const drawAmount = (label, value, options = {}) => {
    drawText(label, width - 200, currentY, {
      fontSize: 10,
      font: helveticaBold,
      align: "right",
      ...options,
    });
    drawText(formatCurrency(currencySymbol, value), width - 60, currentY, {
      fontSize: 10,
      align: "right",
      ...options,
    });
    currentY -= 20;
  };

  drawAmount("Subtotal:", subtotal);
  drawAmount("Tax Amount:", totalTax);
  if (deliveryCharge > 0) drawAmount("Delivery Charge:", deliveryCharge);
  if (deliveryTip > 0) drawAmount("Delivery Tip:", deliveryTip);
  if (discount > 0) drawAmount("Discount:", discount);

  currentY -= 10;
  page.drawLine({
    start: { x: width - 250, y: currentY + 5 },
    end: { x: width - 50, y: currentY + 5 },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9),
  });

  currentY -= 10;
  drawAmount("Total Amount:", finalTotal, {
    fontSize: 12,
    color: accentColor,
  });
  
// 
// 
  // Footer
  const footerY = 50;
  page.drawLine({
    start: { x: 50, y: footerY + 30 },
    end: { x: width - 50, y: footerY + 30 },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9),
  });

  drawText("Thank you for your business!", width / 2 - 60, footerY + 15, {
    fontSize: 10,
    color: secondaryColor,
  });

  drawText("This is a computer-generated invoice.", width / 2 - 70, footerY, {
    fontSize: 8,
    color: secondaryColor,
  });

  // Save and download PDF
  const pdfBytes = await pdfDoc.save();
  const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
  saveAs(pdfBlob, `invoice_${id}.pdf`);
};

export default GenerateInvoicePDF;
