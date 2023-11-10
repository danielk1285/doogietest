const {  Timestamp } = require('firebase-admin/firestore');
const {addNewWallet} = require("./collections");
const {trackEvent} = require("./analytics");

function validateExchangeRequest(data)
{
    // Validate the JSON structure
    if (
    //  typeof data.sendingWalletRefrence !== 'object' || data.sendingWalletRefrence !== null ||
    //  typeof data.receivingWalletRefrence !== 'object' || data.receivingWalletRefrence !== null ||
      !['ILS', 'USD', 'EUR'].includes(data.currencyTo) ||
      !['ILS', 'USD', 'EUR'].includes(data.currencyFrom) || data.currencyFrom === data.currencyTo ||
      typeof data.amountToSend !== 'number' ||
      typeof data.amountLeftToSend !== 'number' || data.amountLeftToSend !== data.amountToSend ||
    //  typeof data.amountConverted !== 'number' || data.amountConverted !== 0 || // Force to 0
    //  typeof data.amountReceived !== 'number' || data.amountReceived !== 0 || // Force to 0
      !['Exchange'].includes(data.action) ||
      //typeof data.errorCode !== 'number' || data.errorCode !== 0 || //Force to be 0
      //!data.createdAt || //Will be done in the BE
      
      //!data.timeToFinishExchange || // Force time to finish
      !['Community', 'Spot'].includes(data.askedExchangeType)
    ) {
      return false;
    }
    else
    {
      return true;
    }
}

function validateTransferRequest(data)
{
    // Validate the JSON structure
    if (
      //typeof data.userId !== 'string' ||
      typeof data.amountToSend !== 'number' ||
      !['ILS', 'USD', 'EUR','GBP'].includes(data.currency)
      /*
      Some bank account and KYC checks
      */
    ) {
      return false;
    }
    else
    {
      return true;
    }
}
function validateWithdrawalRequest(data)
{

    // Validate the JSON structure
    if (
//      typeof data.userId !== 'string' ||
      typeof data.amountToWithdraw !== 'number' ||
      !['ILS', 'USD', 'EUR','GBP'].includes(data.currency)

      /*
      Some bank account and KYC checks
      */
    ) {
      return false;
    }
    else
    {
      return true;
    }
}

 //Function to create new transfers
 async function createNewTransfer(data,admin,user)
 {
    pushToFirebase = false;
    var activityMap =
    {
      "userID":"",
      "transfer":{
        "status":"",
        "error message":"",
        "Sent Amount":"",
        "Bank":"",
        "Date & Time":"",

      },
      "withdraw":{
        "Withdrawl Amount":"",
        "error message":"",
        "Bank":"",
        "Date & Time":"",
      },
      "exchange":{
        "Sent Amount":"",
        "Expected Amount":"",
        "Expected Rate":"",
        "Date & Time":"",
      }
    }
    var activity = {};
    try{
      if('Exchange' === data.action)
      {
        if(validateExchangeRequest(data))
        {
          pushToFirebase = true;
          data.amountConverted = 0;
          data.amountReceived = 0;
          data.errorCode = 0;
          data.createdAt = Timestamp.now();
          data.timeToFinishExchange = new Date();
          data.timeToFinishExchange.setDate(data.timeToFinishExchange.getDate() + 5);
 /*         activity = {"userID":uid,
              "type":"Exchange",
              "status":"In Progress",
              "sent amount":"",
              "expected amount":"",
              "conversion rate":"",
              "date & time":New Date(Timestamp.now()),
      
            }*/
          }
      }
      else if('Transfer' === data.action)
      {
        if(validateTransferRequest(data))
        {
          pushToFirebase = true;
          data.errorCode = 0;
          data.createdAt = Timestamp.now();
          //Add wallets to user
           /*        
          activity = {"userID":uid,
              "type":"Transfer",
              "status":"In Progress",
              "sent amount":"",
              "Bank":"",
              "date & time":New Date(Timestamp.now()),
      
            }*/
        }
      }
      else if('Withdrawal' === data.action)
      {
        if(validateWithdrawalRequest(data))
        {
          pushToFirebase = true;
          data.errorCode = 0;
          data.createdAt = Timestamp.now();
          /*activity = {"userID":uid,
              "type":"Withdrawal",
              "status":"In Progress",
              "expected amount":"",
              "Bank":"",
              "date & time":New Date(Timestamp.now()),
      
            }*/
        }
      }
      if(!pushToFirebase)
      {
        throw new functions.https.HttpsError('invalid-argument', 'Missing or invalid data.');
        //return res.status(400).send('Invalid JSON structure');
      }

 /*     trackEvent(id,       
        {
          "name": "sign_up",
            "params": {
              data,
            }
        }
        );*/
    // Add transfer request to Firestore
    await admin.firestore().collection('transferRequests').add(data).then(()=>{
      try{
//        admin.firestore().collection('transferRequests').add(activity);
      }
      catch(error)
      {
        throw error;
      }
    }).catch((error) => {
      console.error("Error querying Firestore:", error);
      throw error;
    });
    }catch(error)
    {
        throw error;  
    }
 }

module.exports = {
    createNewTransfer
  };
