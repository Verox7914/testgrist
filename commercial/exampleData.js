const exampleData = {
  Number: 14999,
  Issued: Date.parse('2024-10-12') / 1000,
  Due: Date.parse('2024-11-12') / 1000,
  Reference: job xxxx,
  },
  
  Invoicer: {
    Name: 'Thunderous Applause',
    Street1: '812 Automated Rd',
    Street2: null,
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
    {
      Description: 'Rivelatore ottico di fumo analogico indirizzato con isolatore integrato, sensibilità programmabile. 240 indirizzi. Certificazione CPR EN54pt7/pt17 LPCB.',
      Price: 89,
      Quantity: 3,
      Total: 253.65,
      Code: 'ED100',
      Discount: '5%',
    },
    {
      Description: 'Base standard per rivelatori convenzionali (IRIS) ed indirizzati (ENEA)',
      Price: 8,
      Quantity: 6,
      Total: 44.8,
      Code: 'EB0010',
      Discount: '5%',
    },
    {
      Description: 'Rivelatore Multisensor ottico di fumo e di temperatura analogico indirizzato con isolatore integrato, sensibilit à e modalità di funzionamento programmabili. 240 indirizzi. Certificazione CPR EN54pt5/pt17 LPCB.',
      Price: 93,
      Quantity: 3,
      Total: 265.05,
      Code: 'ED300',
      Discount: '5%',
    },
  ],

  Subtotal: 563.5,
  Taxes: 123.97,
  Total: 687.47,
};
