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

function handleError(err) {
  console.error("Error occurred:", err);
  if (window.data) {
    window.data.status = String(err).replace(/^Error: /, '');
  } else {
    alert(`Error: ${err.message || err}`);
  }
}

function updatequotation(row) {
  try {
    if (!row) {
      throw new Error("No data provided");
    }

    // Usa Grist API per ottenere i dati delle tabelle
    console.log("Fetching data from Grist tables...");
    grist.docApi.fetchTable("Offerte").then(offerte => {
      console.log("Offerte:", offerte);
      grist.docApi.fetchTable("Dettagli_Offerta").then(dettagli => {
        console.log("Dettagli_Offerta:", dettagli);
        grist.docApi.fetchTable("Anagrafica").then(anagrafica => {
          console.log("Anagrafica:", anagrafica);
          grist.docApi.fetchTable("Listini_Prodotti").then(listini => {
            console.log("Listini_Prodotti:", listini);

            // Verifica che le colonne richieste siano presenti
            console.log("Checking column names...");
            console.log("Offerte columns:", Object.keys(offerte[0] || {}));
            console.log("Dettagli_Offerta columns:", Object.keys(dettagli[0] || {}));
            console.log("Anagrafica columns:", Object.keys(anagrafica[0] || {}));
            console.log("Listini_Prodotti columns:", Object.keys(listini[0] || {}));

            // Aggrega i dati usando le tabelle ricevute
            const data = aggregateData(offerte, dettagli, anagrafica, listini);
            console.log("Aggregated Data:", data);

            // Carica il primo set di dati
            const offerData = data[0];
            if (offerData) {
              window.quotation = offerData;
            } else {
              throw new Error("No matching data found");
            }
          });
        });
      });
    });
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
