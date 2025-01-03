const exampleData = {
  Number: 14999,
  Issued: Date.parse('2024-10-12') / 1000,
  Due: Date.parse('2024-11-12') / 1000,
  Invoicer: {
    Name: 'Thunderous Applause',
    Street1: '812 Automated Rd',
    City: 'New York',
    State: 'NY',
    Zip: '10003',
    Email: 'applause@thunder.com',
    Phone: '+1-800-111-1111',
    Website: 'applause.com',
  },
  Client: {
    Name: 'Monkeys Juggling',
    Street1: '100 Banana St',
    City: 'Bananaberg',
    State: 'NJ',
    Zip: '07048',
  },
  Items: [
    { Description: 'Optical smoke detector', Price: 89, Quantity: 3, Total: 253.65, Code: 'ED100' },
    { Description: 'Standard detector base', Price: 8, Quantity: 6, Total: 44.8, Code: 'EB0010' },
  ],
  Subtotal: 298.45,
  Taxes: 65.46,
  Total: 363.91,
};