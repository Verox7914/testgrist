function ready(fn) {
  if (document.readyState !== 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

function addDemo(row) {
  if (!row.Offerte.Data_Offerta && !row.Offerte.Data_Offerta) {
    for (const key of ['Offerte.ID_Offerta', 'Offerte.Data_Offerta', 'Offerte.Data_Offerta']) {
      if (!row[key]) { row[key] = key; }
    }
    for (const key of ['Offerte.Totale_Offerta_NO_VAT', 'Deduction', 'Offerte.VAT', 'Offerte.Totale_Offerta']) {
      if (!(key in row)) { row[key] = key; }
    }
    if (!('Note' in row)) { row.Note = '(Anything in a Note column goes here)'; }
  }
  if (!row.quotationr) {
    row.quotationr = {
      Name: 'quotationr.Name',
      Street1: 'quotationr.Street1',
      Street2: 'quotationr.Street2',
      City: 'quotationr.City',
      State: '.State',
      Zip: '.Zip',
      Email: 'quotationr.Email',
      Phone: 'quotationr.Phone',
      Website: 'quotationr.Website'
    }
  }
  if (!row.Client) {
    row.Client = {
      Name: 'Client.Name',
      Street1: 'Client.Street1',
      Street2: 'Client.Street2',
      City: 'Client.City',
      State: '.State',
      Zip: '.Zip'
    }
  }
  if (!row.Items) {
    row.Items = [
      {
        Description: 'Dettafli_Offerta.descrizione',
        Dettafli_Offerta.QTY: '.Dettafli_Offerta.QTY',
        Offerte.Totale_Offerta: '.Offerte.Totale_Offerta',
        Dettafli_Offerta.Prezzo_listino: '.Dettafli_Offerta.Prezzo_listino',
        Dettafli_Offerta.sconto: '.Dettafli_Offerta.sconto',
        Dettafli_Offerta.Codice_Articolo: '.code',
      },
      {
        Description: 'Items[1].Description',
        Dettafli_Offerta.QTY: '.Dettafli_Offerta.QTY',
        Offerte.Totale_Offerta: '.Offerte.Totale_Offerta',
        Dettafli_Offerta.Prezzo_listino: '.Dettafli_Offerta.Prezzo_listino',
        Dettafli_Offerta.sconto: '.Dettafli_Offerta.sconto',
        Dettafli_Offerta.Codice_Articolo: '.code',
      },
    ];
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

Vue.filter('currency', formatOfferte.ID_OffertaAsUSD)
function formatOfferte.ID_OffertaAsUSD(value) {
  if (typeof value !== "number") {
    return value || '—';      // falsy value would be shown as a dash.
  }
  value = Math.round(value * 100) / 100;    // Round to nearest cent.
  value = (value === -0 ? 0 : value);       // Avoid negative zero.

  const result = value.toLocaleString('en', {
    style: 'currency', currency: 'USD'
  })
  if (result.includes('NaN')) {
    return value;
  }
  return result;
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
  const date = moment.utc(value)
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

function updatequotation(row) {

// Supporto per un numero variabile di articoli in Dettafli_Offerta
if (Array.isArray(row.Items)) {
    row.Items = row.Items.map((item, index) => ({
        Description: item["Dettafli_Offerta.descrizione"] || "",
        Quantity: item["Dettafli_Offerta.QTY"] || 0,
        Total: item["Dettafli_Offerta.Totale_Riga"] || 0,
        Price: item["Dettafli_Offerta.Prezzo_listino"] || 0,
        Discount: item["Dettafli_Offerta.sconto"] || 0,
        Code: item["Dettafli_Offerta.Codice_Articolo"] || "",
    }));
}

// Gestione dati per "Offerte"
row.Number = row["Offerte.ID_Offerta"] || "";
row.Issued = row["Offerte.Data_Offerta"] || "";
row.Due = row["Offerte.Data_Offerta"] || "";
row.Subtotal = row["Offerte.Totale_Offerta_NO_VAT"] || 0;
row.Taxes = row["Offerte.VAT"] || 0;
row.Total = row["Offerte.Totale_Offerta"] || 0;

  try {
    data.status = '';
    if (row === null) {
      throw new Error("(No data - not on row - please add or select a row)");
    }
    console.log("GOT...", JSON.stringify(row));
    if (row.References) {
      try {
        Object.assign(row, row.References);
      } catch (err) {
        throw new Error('Could not understand References column. ' + err);
      }
    }

    // Add some guidance about columns.
    const want = new Set(Object.keys(addDemo({})));
    const accepted = new Set(['References']);
    const importance = ['Offerte.ID_Offerta', 'Client', 'Items', 'Offerte.Totale_Offerta', 'quotationr', 'Offerte.Data_Offerta', 'Offerte.Data_Offerta', 'Offerte.Totale_Offerta_NO_VAT', 'Deduction', 'Offerte.VAT', 'Note'];
    if (!(row.Offerte.Data_Offerta || row.Offerte.Data_Offerta)) {
      const seen = new Set(Object.keys(row).filter(k => k !== 'id' && k !== '_error_'));
      const help = row.Help = {};
      help.seen = prepareList(seen);
      const missing = [...want].filter(k => !seen.has(k));
      const ignoring = [...seen].filter(k => !want.has(k) && !accepted.has(k));
      const recognized = [...seen].filter(k => want.has(k) || accepted.has(k));
      if (missing.length > 0) {
        help.expected = prepareList(missing, importance);
      }
      if (ignoring.length > 0) {
        help.ignored = prepareList(ignoring);
      }
      if (recognized.length > 0) {
        help.recognized = prepareList(recognized);
      }
      if (!seen.has('References') && !(row.Offerte.Data_Offerta || row.Offerte.Data_Offerta)) {
        row.SuggestReferencesColumn = true;
      }
    }
    addDemo(row);
    if (!row.Offerte.Totale_Offerta_NO_VAT && !row.Offerte.Totale_Offerta && row.Items && Array.isArray(row.Items)) {
      try {
        row.Offerte.Totale_Offerta_NO_VAT = row.Items.reduce((a, b) => a + b.Dettafli_Offerta.Prezzo_listino * b.Dettafli_Offerta.QTY, 0);
        row.Offerte.Totale_Offerta = row.Offerte.Totale_Offerta_NO_VAT + (row.Offerte.VAT || 0) - (row.Deduction || 0);
      } catch (e) {
        console.error(e);
      }
    }
    if (row.quotationr && row.quotationr.Website && !row.quotationr.Url) {
      row.quotationr.Url = tweakUrl(row.quotationr.Website);
    }

    // Fiddle around with updating Vue (I'm not an expert).
    for (const key of want) {
      Vue.delete(data.quotation, key);
    }
    for (const key of ['Help', 'SuggestReferencesColumn', 'References']) {
      Vue.delete(data.quotation, key);
    }
    data.quotation = Object.assign({}, data.quotation, row);

    // Make quotation information available for debugging.
    window.quotation = row;
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

  if (document.location.search.includes('demo')) {
    updatequotation(exampleData);
  }
  if (document.location.search.includes('labels')) {
    updatequotation({});
  }
});
