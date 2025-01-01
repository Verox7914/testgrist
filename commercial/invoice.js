// Updated JavaScript to adapt to the new CSV data format
function parseCSVData(csvData) {
  // Function to parse raw CSV data into structured JavaScript objects
  const parsedData = csvData.map(row => {
      return {
          ID: row['ID_Offerta'] || row['ID_Prodotto'] || row['ID_Dettaglio'],
          Date: row['Data_Offerta'] || null,
          Client: {
              Name: row['Nome_Cliente'] || null,
              Street1: row['Indirizzo'] || 'Unknown Address',
              City: row['Citta'] || 'Unknown City',
              State: row['Provincia'] || 'NA',
              Zip: row['CAP'] || '00000'
          },
          Items: row['Codice_Articolo'] ? [{
              Code: row['Codice_Articolo'],
              Description: row['descrizione'],
              Quantity: parseInt(row['QTY'] || 0),
              Price: parseFloat(row['Prezzo_listino'].replace(',', '.') || 0),
              Total: parseFloat(row['Prezzo_vendita'].replace(',', '.') || 0)
          }] : [],
          Total: parseFloat(row['Totale_offerta']?.replace(',', '.') || 0),
          VAT: row['VAT'] || '22%'
      };
  });
  return parsedData;
}

function generateInvoice(data) {
  // Generates an invoice object from the parsed data
  return {
      Number: data.ID,
      Issued: new Date(data.Date).getTime() / 1000,
      Due: new Date(data.Date).getTime() / 1000 + 30 * 86400, // 30 days later
      Invoicer: {
          Name: 'Example Company',
          Street1: '123 Example St',
          City: 'Cityname',
          State: 'ST',
          Zip: '12345',
          Email: 'example@company.com',
          Phone: '+1-800-123-4567',
          Website: 'company.com',
      },
      Client: data.Client,
      Items: data.Items,
      Subtotal: data.Items.reduce((acc, item) => acc + item.Total, 0),
      Taxes: data.VAT === '22%' ? data.Total * 0.22 : 0,
      Total: data.Total
  };
}

// Example of integrating data and generating an invoice
document.addEventListener('DOMContentLoaded', () => {
  // Simulating the CSV data input
  const csvData = [
      // Include parsed CSV data here for testing
  ];

  const parsedData = parseCSVData(csvData);
  const invoices = parsedData.map(generateInvoice);

  console.log('Generated Invoices:', invoices);

  // Use the invoices to update the Vue application
  // Assuming Vue instance is available
  app.data = { ...app.data, invoices };
});
