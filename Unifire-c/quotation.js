function ready(fn) {
  if (document.readyState !== 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

function addDemo(row) {
  if (!row.Issued && !row.Due) {
    for (const key of ['Number', 'Issued', 'Due', 'Reference']) {
      if (!row[key]) { row[key] = key; }
    }
    for (const key of ['Subtotal', 'Deduction', 'Taxes', 'Total']) {
      if (!(key in row)) { row[key] = key; }
    }
    if (!('Note' in row)) { row.Note = '(Anything in a Note1 column goes here)'; }
    if (!('Note2' in row)) { row.Note2 = '(Anything in a Note2 column goes here)'; }
    if (!('Note3' in row)) { row.Note3 = '(Anything in a Note3 column goes here)'; }
    if (!('deliveryTerms' in row)) { row.deliveryTerms = '(Anything in a deliveryTerms column goes here)'; }
    if (!('paymentTerms' in row)) { row.paymentTerms = '(Anything in a paymentTerms column goes here)'; }
    
  }
  if (!row.Invoicer) {
    row.Invoicer = {
      Name: 'Invoicer.Name',
      Street1: 'Invoicer.Street1',
      Street2: 'Invoicer.Street2',
      City: 'Invoicer.City',
      State: '.State',
      Zip: '.Zip',
      Email: 'Invoicer.Email',
      Phone: 'Invoicer.Phone',
      Website: 'Invoicer.Website'
    };
  }
  if (!row.Client) {
    row.Client = {
      Name: 'Anagrafica.Nome_Cliente',
      Street1: 'Anagrafica.indirizzo',
      City: 'Client.City',
      State: '.State',
      Zip: '.Zip'
    };
  }
  return row;
}

const data = {
  count: 0,
  quotation: '',
  status: 'waiting',
  tableConnected: false,
  rowConnected: false,
  haveRows: false,
};
let app = undefined;

Vue.filter('currency', formatNumberAsEUR);
function formatNumberAsEUR(value) {
  if (typeof value !== "number") {
    return value || '—';      // falsy value would be shown as a dash.
  }
  value = Math.round(value * 100) / 100;    // Round to nearest cent.
  value = (value === -0 ? 0 : value);       // Avoid negative zero.

  const result = value.toLocaleString('en', {
    style: 'currency', currency: 'EUR'
  });
  if (result.includes('NaN')) {
    return value;
  }
  return result;
}

// Funzione per calcolare le tasse
function calculateTotalTaxes(row) {
  if (row.Items && Array.isArray(row.Items)) {
    try {
      // Somma le tasse di tutti gli elementi in Items
      row.Taxes = row.Items.reduce((sum, item) => sum + (item.Taxes || 0), 0);
    } catch (e) {
      console.error("Errore durante la somma delle tasse:", e);
    }
  }
}

Vue.filter('fallback', function(value, str) {
  if (!value) {
    throw new Error("Please provide column " + str);
  }
  return value;
});

Vue.filter('asDate', function(value) {
  if (typeof(value) === 'number') {
    value = new Date(value * 1000);
  }
  const date = moment.utc(value);
  return date.isValid() ? date.format('MMMM DD, YYYY') : value;
});

function tweakUrl(url) {
  if (!url) { return url; }
  if (url.toLowerCase().startsWith('http')) {
    return url;
  }
  return 'https://' + url;
};

function handleError(err) {
  console.error(err);
  const target = app || data;
  target.quotation = '';
  target.status = String(err).replace(/^Error: /, '');
  console.log(data);
}

function prepareList(lst, order) {
  if (order) {
    let orderedLst = [];
    const remaining = new Set(lst);
    for (const key of order) {
      if (remaining.has(key)) {
        remaining.delete(key);
        orderedLst.push(key);
      }
    }
    lst = [...orderedLst].concat([...remaining].sort());
  } else {
    lst = [...lst].sort();
  }
  return lst;
}

function roundToTwoDecimals(value) {
  return Math.round(value * 100) / 100;
}

function updatequotation(row) {
  try {
    data.status = '';
    if (row === null) {
      throw new Error("(No data - not on row - please add or select a row)");
    }

    console.log("GOT row before processing:", JSON.stringify(row));

    if (row.References) {
      try {
        Object.assign(row, row.References);
      } catch (err) {
        throw new Error('Could not understand References column. ' + err);
      }
    }

    // Calcola Subtotal come somma dei valori definitivi di Total negli Items
    if (row.Items && Array.isArray(row.Items)) {
      row.Subtotal = row.Items.reduce((sum, item) => sum + (item.Total || 0), 0);

      // Calcola Taxes come somma dei valori definitivi di Taxes negli Items
      calculateTotalTaxes(row);

      // Calcola il valore globale Total come somma di Subtotal e Taxes
      row.Total = (row.Subtotal || 0) + (row.Taxes || 0) - (row.Deduction || 0);
    }

    // Gestisci dati Co2
    if (row.Co2 && Array.isArray(row.Co2)) {
      console.log("Processing Co2 data before rounding:", row.Co2);

      // Applica l'arrotondamento a ogni elemento di Co2
      row.Co2 = row.Co2.map(item => {
        return {
          ...item,
          Lenght: roundToTwoDecimals(item.Lenght),
          Width: roundToTwoDecimals(item.Width),
          Height: roundToTwoDecimals(item.Height),
          Area2: roundToTwoDecimals(item.Area2),
          VOLUME5Perc: roundToTwoDecimals(item.VOLUME5Perc),
          FLOODING_FACTOR: roundToTwoDecimals(item.FLOODING_FACTOR),
          CO2_DES_qty: roundToTwoDecimals(item.CO2_DES_qty)
        };
      });

      data.quotation.Co2 = row.Co2;

      console.log("Processed Co2 data after rounding:", data.quotation.Co2);

      // Calcola aggregati
      row.TotalVolumeCo2 = row.Co2.reduce((sum, item) => sum + (item.VOLUME5Perc || 0), 0);
      row.TotalCO2Qty = row.Co2.reduce((sum, item) => sum + (item.CO2_DES_qty || 0), 0);
      row.TotalCylinders = row.Co2.reduce((sum, item) => sum + (item.CYLIDER_Qty || 0), 0);
    } else {
      console.warn("Co2 data is missing or invalid:", row.Co2);
      data.quotation.Co2 = [];
    }

    if (row.Invoicer && row.Invoicer.Website && !row.Invoicer.Url) {
      row.Invoicer.Url = tweakUrl(row.Invoicer.Website);
    }

    // Aggiunge informazioni aggiuntive e suggerimenti sulle colonne
    const want = new Set(Object.keys(addDemo({})));
    for (const key of want) {
      Vue.delete(data.quotation, key);
    }
    data.quotation = Object.assign({}, data.quotation, row);

    console.log("Final quotation data:", data.quotation);

  } catch (err) {
    handleError(err);
  }
}

ready(function() {
  // Update the quotation anytime the document data changes.
  grist.ready();
  grist.onRecord(updatequotation);

  // Monitor status so we can give user advice.
  grist.on('message', msg => {
    // If we are told about a table but not which row to access, check the
    // number of rows.  Currently if the table is empty, and "select by" is
    // not set, onRecord() will never be called.
    if (msg.tableId && !app.rowConnected) {
      grist.docApi.fetchSelectedTable().then(table => {
        if (table.id && table.id.length >= 1) {
          app.haveRows = true;
        }
      }).catch(e => console.log(e));
    }
    if (msg.tableId) { app.tableConnected = true; }
    if (msg.tableId && !msg.dataChange) { app.RowConnected = true; }
  });

  Vue.config.errorHandler = function (err, vm, info)  {
    handleError(err);
  };

  app = new Vue({
    el: '#app',
    data: data
  });
});
