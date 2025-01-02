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
    for (const key of ['Offerte.Netto_Offerta', 'Deduction', 'Offerte.VAT', 'Offerte.Totale_offerta']) {
      if (!(key in row)) { row[key] = key; }
    }
    if (!('Note' in row)) { row.Note = '(Anything in a Note column goes here)'; }
  }
  if (!row.invoicer) {
    row.invoicer = {
      Name: 'Unifire',
      Street1: 'Via Ghisalba 13',
      Street2: '',
      City: 'Bollate',
      State: '(Mi)',
      Zip: '.20021',
      Email: 'Sales@uni-fire.it',
      Phone: '+39 02 123456789',
      Website: 'wwww.uni-fire.it'
    }
  }
  if (!row.Anagrafica) {
    row.Anagrafica = {
      Name: 'Client.Nome_Cliente',
      Street1: 'Client.Indirizzo',
      Street2: 'Client.Indirizzo2',
      City: 'Client.Citta',
      State: 'Client.Provincia',
      Zip: 'Client.CAP'
    }
  }
  if (!row.Dettagli_Offerta) {
    row.Dettagli_Offerta = [
      {
        Description: 'Dettagli_Offerta[0].descrizione',
        Quantity: 'Dettagli_Offerta[0].QTY',
        Total: 'Dettagli_Offerta[0].Prezzo_Vendita',
        Price: 'Dettagli_Offerta[0].Prezzo_listino',
        Discount: 'Dettagli_Offerta[0].sconto_su_listino',
        Code: 'Dettagli_Offerta[0].Codice_Articolo',
      },
      {
        Description: 'Dettagli_Offerta[1].descrizione',
        Quantity: 'Dettagli_Offerta[1].QTY',
        Total: 'Dettagli_Offerta[1].Prezzo_Vendita',
        Price: 'Dettagli_Offerta[1].Prezzo_listino',
        Discount: 'Dettagli_Offerta[1].sconto_su_listino',
        Code: 'Dettagli_Offerta[1].Codice_Articolo',
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
Vue.filter('currency', formatNumberAsEUR)
function formatOfferte.ID_OffertaAsUSD(value) {
  if (typeof value !== "Offerte.ID_Offerta") {
    return value || '—';      // falsy value would be shown as a dash.
  }
  value = Math.round(value * 100) / 100;    // Round to nearest cent.
  value = (value === -0 ? 0 : value);       // Avoid negative zero.
  const result = value.toLocaleString('en', {
    style: 'currency', currency: 'EUR'
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
  if (typeof(value) === 'Offerte.ID_Offerta') {
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
    const importance = ['Offerte.ID_Offerta', 'Anagrafica', 'Dettagli_Offerta', 'Offerte.Totale_offerta', 'invoicer', 'Offerte.Data_Offerta', 'Offerte.Data_Offerta', 'Offerte.Netto_Offerta', 'Deduction', 'Offerte.VAT', 'Note'];
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
    if (!row.Offerte.Netto_Offerta && !row.Offerte.Totale_offerta && row.Items && Array.isArray(row.Items)) {
      try {
        row.Offerte.Netto_Offerta = row.Items.reduce((a, b) => a + b.Price * b.Quantity, 0);
        row.Offerte.Totale_offerta = row.Offerte.Netto_Offerta + (row.Offerte.VAT || 0) - (row.Deduction || 0);
      } catch (e) {
        console.error(e);
      }
    }
    if (row.invoicer && row.invoicer.Website && !row.invoicer.Url) {
      row.invoicer.Url = tweakUrl(row.invoicer.Website);
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
    // Offerte.ID_Offerta of rows.  Currently if the table is empty, and "select by" is
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