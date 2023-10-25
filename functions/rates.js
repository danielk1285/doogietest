const fetch = require('node-fetch');
const {  Timestamp } = require('firebase-admin/firestore');


var rates = {};


// define the currencies we want to retrieve exchange rates for
const currencies = ['USD', 'EUR', 'GBP','ILS'];
const OPENEXCHANGE_APP_ID = "c8a30bf78a1c4d3dbd053c0e23711f82";
//functions.config().openexchange.value;
// function to retrieve current exchange rates using the Open Exchange Rates API
async function fetchExchangeRates() {
  try{
  const apiEndpoint = "https://openexchangerates.org/api/latest.json?app_id="+OPENEXCHANGE_APP_ID+"&symbols="+currencies.join(',');
  console.log(apiEndpoint);
  const response = await fetch(apiEndpoint);
  if (!response.ok) {
    throw new Error("Failed to fetch exchange rates:"+response.statusText);

  }
  const json = await response.json();
  rates = json.rates;
  console.log("fetchExchangeRates here are the rates:"+JSON.stringify(rates));
}catch(error){
  console.log(`Error:${error}`);
  throw new Error("Failed to fetch exchange rates:"+error);
}
};

// function to update exchange rates in Firestore
async function updateExchangeRates(admin) {

  const dataToAdd ={
    USD:rates.USD,
    GBP:rates.GBP,
    ILS:rates.ILS,
    EUR:rates.EUR,
    updateddate: Timestamp.now(),
  }
  //.firestore().collection('transferRequests')
  const db = admin.firestore();
  const ref = db.collection('latestrates').doc('rates');
  await ref.set(dataToAdd);
  console.log("updateExchangeRates Rates:"+JSON.stringify(rates));
}

// main function to fetch and update exchange rates
async function fetchAndUpdateExchangeRates(admin) {
  try {
    console.log("Fetching exchange rates");
    await fetchExchangeRates();
    await updateExchangeRates(admin);
    console.log(`Updated exchange rates for ${currencies.join(', ')}`);
  } catch (err) {
    console.error(err);
  }
}

// function to retrieve the exchange rate between two currencies from Firebase Realtime Database
function getExchangeRate(fromCurrency, toCurrency,firestore) {
  console.log("getExchangeRate Does rates have something:"+fromCurrency+":"+rates[fromCurrency]+" "+toCurrency+":"+ rates[toCurrency]);
  console.log("getExchangeRate rates stringified:"+JSON.stringify(rates));
  if(rates[fromCurrency] === undefined || rates[toCurrency] === undefined)
  {

        // Specify the path to the document
    const docRef = firestore.collection('latestrates').doc('rates');


    // Retrieve the document
    docRef.get()
      .then((doc) => {
        if (doc.exists) {
          // Document found, access its data
          rates = doc.data();
          console.log("Rates from DB:"+rates);
        } else {
          // Document not found
          console.log('Rates document not found');
        }
      })
      .catch((error) => {
        console.error('Error retrieving rates:', error);
      });
  }
  if(rates[fromCurrency]>0&&rates[toCurrency]>0)//Check rates exist.
    {
      console.log(`FromCurrency:${fromCurrency} ToCurrency${toCurrency}`);
      const fromRate = rates[fromCurrency];
      const toRate = rates[toCurrency];
      if ((!fromRate || !toRate)||(fromRate === undefined || toRate  === undefined)) {
        throw new Error(`Exchange rate not found for ${toCurrency}/${fromCurrency}`);
      }
      return toRate / fromRate;
    }
    else{
      throw new Error(`Exchange rate is not initialized or old value`);
    }
  }
  function getRates()
  {
    console.log("getRates: returning rates");
    return JSON.stringify(rates);
  }
  module.exports = {
    fetchAndUpdateExchangeRates,
    getExchangeRate,
    getRates
  };


