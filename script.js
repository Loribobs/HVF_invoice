// Function to format date as DD/MM/YYYY
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Function to format numbers with commas
function formatNumber(number) {
  // Convert to string with 2 decimals, then add commas
  return number.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Move updateTotals OUTSIDE of DOMContentLoaded to make it globally accessible
function updateTotals() {
  let subtotal = 0;
  document.querySelectorAll('#itemsPreviewTable tr').forEach(row => {
    // Get the text, remove everything except digits and decimal point
    const amountText = row.children[4].textContent.trim();
    // Remove ₦ symbol, commas, and any other non-numeric characters except decimal point
    const cleanAmount = amountText.replace(/[₦,\s]/g, '');
    const amount = parseFloat(cleanAmount) || 0;
    console.log('Amount:', amountText, '→', amount);
    subtotal += amount;
  });

  const tax = parseFloat(document.getElementById('taxInput').value) || 0;
  const total = subtotal + tax;

  document.getElementById('subtotal').textContent = formatNumber(subtotal);
  document.getElementById('tax').textContent = formatNumber(tax);
  document.getElementById('total').textContent = formatNumber(total);

  // Copy items to PDF preview table
  if (document.getElementById('invoiceTable')) {
    const invoiceTbody = document.getElementById('invoiceTable').querySelector('tbody');
    invoiceTbody.innerHTML = '';
    
    // Copy filled rows from preview table
    document.querySelectorAll('#itemsPreviewTable tr').forEach(row => {
      invoiceTbody.appendChild(row.cloneNode(true));
    });
    
    // Add empty placeholder rows to fill up to 5 total rows
    const currentRows = invoiceTbody.querySelectorAll('tr').length;
    const emptyRowsNeeded = 5 - currentRows;
    
    for (let i = 0; i < emptyRowsNeeded; i++) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `
        <td class="border px-4 py-2">&nbsp;</td>
        <td class="border px-4 py-2">&nbsp;</td>
        <td class="border px-4 py-2">&nbsp;</td>
        <td class="border px-4 py-2">&nbsp;</td>
        <td class="border px-4 py-2">&nbsp;</td>
      `;
      invoiceTbody.appendChild(emptyRow);
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {

  const stepClient = document.getElementById('step-client');
  const stepPreview = document.getElementById('step-preview');
  
  let itemCount = 0;
  const maxItems = 5;

  // Add Item button
  document.getElementById('addItemBtn').addEventListener('click', function() {
    if (itemCount >= maxItems) {
      alert('Maximum 5 items allowed.');
      return;
    }
    
    const product = document.getElementById('productInput').value.trim();
    const grade = document.getElementById('gradeInput').value.trim();
    const unitPrice = parseFloat(document.getElementById('unitPriceInput').value) || 0;
    const quantity = parseFloat(document.getElementById('quantityInput').value) || 0;

    if (!product || !grade || unitPrice <= 0 || quantity <= 0) {
      alert('Please fill all fields with valid numbers.');
      return;
    }

    const amount = unitPrice * quantity;

    // Add row to preview table
    const tbody = document.getElementById('itemsPreviewTable');
    const row = document.createElement('tr');
    row.innerHTML = `
    <td class="border px-4 py-2">${product}</td>
    <td class="border px-4 py-2">${grade}</td>
    <td class="border px-4 py-2">₦${formatNumber(unitPrice)}</td>
    <td class="border px-4 py-2">${quantity}</td>
    <td class="border px-4 py-2">₦${formatNumber(amount)}</td>
    `;
    tbody.appendChild(row);
    
    itemCount++;

    // Clear inputs
    document.getElementById('productInput').value = '';
    document.getElementById('gradeInput').value = '';
    document.getElementById('unitPriceInput').value = '';
    document.getElementById('quantityInput').value = '';

    updateTotals();
  });

  // Preview Invoice button
  document.getElementById('toPreviewBtn').addEventListener('click', function() {
    document.getElementById('clientName').textContent = document.getElementById('clientNameInput').value;
    document.getElementById('clientAddress').textContent = document.getElementById('clientAddressInput').value;
    document.getElementById('clientPhone').textContent = document.getElementById('clientPhoneInput').value;

    // UPDATE INVOICE NUMBER FROM INPUT
    const invoiceNumber = document.getElementById('invoiceNumberInput').value.trim() || '0001';
    document.getElementById('invoiceNo').textContent = invoiceNumber;

    // Set dynamic dates
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + 10);
    
    document.getElementById('invoiceDate').textContent = formatDate(today);
    document.getElementById('dueDate').textContent = formatDate(dueDate);
  
    updateTotals();
  
    stepClient.style.display = 'none';
    stepPreview.style.display = 'block';
    
    // Remove flexbox centering when showing preview
    document.body.style.display = 'block';
    document.body.style.alignItems = 'unset';
    document.body.style.justifyContent = 'unset';
  });

  // Back to Items button
  document.getElementById('backToItemsBtn').addEventListener('click', function() {
    stepPreview.style.display = 'none';
    stepClient.style.display = 'block';
    
    // Restore flexbox centering for the form
    document.body.style.display = 'flex';
    document.body.style.alignItems = 'center';
    document.body.style.justifyContent = 'center';
  });

  // Download PDF button
  document.getElementById('downloadBtn').addEventListener('click', async function () {
    console.log('Generating PDF…');
  
    const invoice = document.getElementById('invoice');
    const body = document.body;
    const stepClient = document.getElementById('step-client');
    const stepPreview = document.getElementById('step-preview');
    
    // FORCE UPDATE TOTALS AND TABLE BEFORE PDF GENERATION
    updateTotals();
    
    // Store original styles
    const originalStyles = {
      bodyClass: body.className,
      bodyPadding: body.style.padding,
      bodyMargin: body.style.margin,
      invoiceWidth: invoice.style.width,
      invoiceMargin: invoice.style.margin,
      invoicePadding: invoice.style.padding
    };
    
    // Hide the form, show only preview
    stepClient.style.display = 'none';
    stepPreview.style.display = 'block';
    
    // Reset body completely
    body.className = '';
    body.style.padding = '0';
    body.style.margin = '0';
    body.style.display = 'block';
    
    // Center invoice in body
    invoice.style.width = '794px';
    invoice.style.margin = '0 auto';
    invoice.style.padding = '0 20px 20px 20px';
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
  
    const opt = {
      margin: 0,
      filename: 'Hillsville_Farms_Invoice.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      }
    };
  
    await html2pdf().set(opt).from(invoice).save();
    
    // Restore everything
    body.className = originalStyles.bodyClass;
    body.style.padding = originalStyles.bodyPadding;
    body.style.margin = originalStyles.bodyMargin;
    body.style.display = '';
    invoice.style.width = originalStyles.invoiceWidth;
    invoice.style.margin = originalStyles.invoiceMargin;
    invoice.style.padding = originalStyles.invoicePadding;
    
    console.log('PDF saved');
  });

});