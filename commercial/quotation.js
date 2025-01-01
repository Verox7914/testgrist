function ready(fn) {
  if (document.readyState !== 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

function aggregateData(offerte, dettagli, anagrafica, listini) {
  return offerte.map(offer => {
    const client = anagrafica.find(c => c.ID_Cliente === offer.Cliente);
    const items = dettagli
      .filter(d => d.N_Offerta === offer.ID_Offerta)
      .map(d => {
        const product = listini.find(p => p.Codice === d.Codice_Articolo);
        return {
          Code: d.Codice_Articolo,
          Description: product ? product.Descrizione : d.descrizione,
          Quantity: d.QTY,
          UnitPrice: product ? product.Prezzo_di_Listino : d.Prezzo_listino,
          Discount: d.sconto_su_listino,
          Total: d.Prezzo_vendita,
        };
      });

    return {
      Client: {
        Name: client ? client.Nome_Cliente : 'Unknown',
        Address: client ? client.Indirizzo : 'Unknown',
        VAT: client ? client.PIVA : 'Unknown',
      },
      Offer: {
        ID: offer.ID_Offerta,
        Date: offer.Data_Offerta,
        Total: offer.Totale_offerta,
        Net: offer.Netto_Offerta,
        VAT: offer.VAT,
      },
      Items: items,
    };
  });
}

function updatequotation(row) {
  try {
    if (!row) {
      throw new Error("No data provided");
    }

    const offerte = []; // Replace with actual data source
    const dettagli = []; // Replace with actual data source
    const anagrafica = []; // Replace with actual data source
    const listini = []; // Replace with actual data source

    const data = aggregateData(offerte, dettagli, anagrafica, listini);
    console.log("Aggregated Data:", data);

    const offerData = data[0];
    if (offerData) {
      window.quotation = offerData;
    } else {
      throw new Error("No matching data found");
    }
  } catch (err) {
    handleError(err);
  }
}

ready(function() {
  grist.ready();
  grist.onRecord(updatequotation);

  Vue.config.errorHandler = function (err, vm, info) {
    handleError(err);
  };
});