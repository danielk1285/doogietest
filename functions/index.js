const functions = require("firebase-functions");

const {  Timestamp } = require('firebase-admin/firestore');

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

//const { firebaseConfig } = require("firebase-functions");
const {  bulkCreateOrUpdateTransactions,
         bulkCreateOrUpdateTransactionRequests,
         createOrUpdateIntraTransaction,
         createOrUpdateTransactionRequest,
         createTestUser, generateNumberOfObjects, bulkCreateOrUpdateUsers,addCurrencies,createOrUpdateUser} = require("./collections");
const {createNewTransfer} = require("./transfers");
const {fetchAndUpdateExchangeRates,getExchangeRate,getRates} = require("./rates");
const {trackEvent} = require("./analytics");

// Get a Firestore instance
const firestore = admin.firestore();

//Initalize exchange rates
fetchAndUpdateExchangeRates(admin);
// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//

exports.helloWorld = functions.https.onRequest((request, response) => {
  // Verify if the user is authenticated

   //trackEvent("test_data");
   functions.logger.info("Hello logs!", {structuredData: true});
   response.send("Hello from Firebase!");
 });

 exports.getrates = functions.https.onRequest((request, response) => {
    // Verify if the user is authenticated
  
     //trackEvent("test_data");
     //functions.logger.info("Hello logs!", {structuredData: true});
     response.send(getRates());
   });

 exports.addTransferRequest = functions.https.onRequest(async (data, context) => {
    try {
    // Verify if the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

        firestore
        .collection("users")
        .where("userId", "==", data.userId)
        .limit(1)
        .get()
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            // Document with the unique field value exists
            const user = querySnapshot.docs[0];
            createNewTransfer(data.body,admin,user);
          } else {
            // Document with the unique field value does not exist
            console.log("User does not exist");
          }
        })
        .catch((error) => {
          console.error("Error querying Firestore:", error);
        });
    
    context.status(201).send({ message: 'createNewTransfer Success' });
    
    }catch (error) {
    console.error(error);
    context.status(500).send({ message: 'createNewTransfer Error' });
    }
  });
 
  exports.matchTransfersRequestOnCall = functions.https.onRequest(async (data, context) => {
    // Verify if the user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }
    try {
      matchTransferUtil();
      context.status(201).send({ message: 'matchTransfersRequestOnCall Success' });
    }catch (error) {
      console.error(error);
      context.status(500).send({ message: 'matchTransfersRequestOnCall Error' });
    }});

    
  exports.createTestUsersOnCall = functions.https.onRequest(async (data, context) => {
    // Verify if the user is authenticated
    try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

    if(data.body.users>30)
    {
      throw error("Number of test users is limited to 30 a batch");
    }  
    users = generateNumberOfObjects(data.body.users,createTestUser);

    bulkCreateOrUpdateUsers(firestore,users);
    trackEvent("14124124112",       
        {
            "name": "createTestUsersOnCall",
            "params": {
                users,
            }
        }
    );
    context.status(201).send({ message: 'bulkCreateOrUpdateUsers Success' });
  }catch (error) {
    console.error("An error occurred: ", error.message);
    context.status(500).send({ message: 'bulkCreateOrUpdateUsers Error' });
    }});

    exports.createOrUpdateUser = functions.https.onRequest(async (data, context) => {
        try{
        // Verify if the user is authenticated
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
        }

            createOrUpdateUser(context.auth.uid,data,firestore);
            console.info("CreateNewUser accepted");
            context.status(201).send({ message: 'CreateNewUser Success' });
        }catch (error) {
            console.error(error);
            context.status(500).send({ message: 'createNewUser Error' });
        }        
    });


    exports.transferRequestsUpdates = functions.firestore.document('transferRequests/{docId}').onWrite((change, context) => {
 /*       const beforeData = change.before.data();
        const afterData = change.after.data();
        if(beforeData == null)
        {
            //Add new activity logic
            return 0;
        }
        if(afterData[action] == "Exchange")
        {
            if(afterData[readyForWithdrawl]==true)
            {
                console.log("Amount "+afterData[amountConverted]+" of user "+ afterData[userId]+" is ready for withdrawl");
                //Create new activity
                //Send PN
            }
            if(beforeData[amountConverted]<afterData[amountConverted])
            {
                console.log("Amount "+afterData[amountConverted]+" of user "+ afterData[userId]+" was converted");
              //Create new activity
                //Send PN
            }
        }
        if(afterData[action] == "Transfer")
        {
            const payload = {
                title:"Your Transfer",
                body: "Your Transfer of amount "+change.currency+""+change.sentamount+" "+change.status,
                target_page: "wallet"
            };
            getfcmToken(change.userId)
            .then((fcmToken) => {
                if(fcmToken!=null)
                {
                    sendPN(fcmToken,payload);
                }
                else
                {
                    console.error('Activity: UserId:'+change.userId+" does not exist or does not have an FCM token.");
                }
                
              })
              .catch((error) => {
                console.error('Error sending push notification:', error);
              });
                createNewActivity(change.userId,change.bankaccount,change.sentamount,change.currency,changeStatus).then(() => {
                console.log('Activity: Created new activity');
                return null;  // Return null or a specific value if needed
              })
              .catch((error) => {
                console.error('Activity: Error creating activity', error);
              });
      }*/
    });

      exports.userUpdates = functions.firestore.document('users/{docId}').onWrite((change, context) => {
//if new document created, send welcome email
//if document updated, for now only update on new wallet, kyc completed, new bank and new business
        });
        
function getRandomCurrency(currencies,sendingCurrency) {
    // Filter the currencies array to exclude the sending currency
    const availableCurrencies = currencies.filter((currency) => currency !== sendingCurrency);
    
    // Check if there are available currencies to choose from
    if (availableCurrencies.length === 0) {
        throw new Error('No available currencies to choose from');
    }
    
    // Generate a random index
    const index = Math.floor(Math.random() * availableCurrencies.length);
    
    // Return the chosen currency
    return availableCurrencies[index];
    }
       

  exports.matchTransfers = functions.pubsub.schedule('every 120 minutes').onRun((context)=>
  {
    try {
      matchTransferUtil()
      console.info("matchTransfers Every 120 min Success");
  }catch (error) {
    console.error("matchTransfers Every 120 min Error: "+error);
    }});

    exports.createTransactionDemoRequests = functions.https.onRequest(async (data, context) => {
    try{
        // Verify if the user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

        const numberOfRequests = data.body.numberOfRequests;
        const usersRef = firestore.collection("users");
        const usersSnapshot = await usersRef.get();
    
        const transfers = [];
    
        // Loop through all the users to get their wallet balances
        usersSnapshot.forEach((doc) => {
          const user = doc.data();
          const wallets = user.Wallets; 

          if (wallets) {
            Object.keys(wallets).forEach((walletId) => {
              const wallet = wallets[walletId];
              transfers.push({
                userId: doc.id,
                walletId: walletId,
                balance: wallet.amount,
                sendingBank: 'test'+Math.floor(Math.random() * wallet.amount)+1,
                amountToTransfer: Math.floor(Math.random() * wallet.amount)+1, 
                currency: wallet.currency,
                currencyTo: getRandomCurrency(['USD', 'EUR', 'ILS'],wallet.currency)
              });
            });
          }
        });
    
        // Shuffle the transfers to select a random subset
        const shuffledtransfers = shuffle(transfers);
        const selectedtransfers = shuffledtransfers.slice(0, numberOfRequests);
        // Create Transfers
        selectedtransfers.forEach((selectedtransfer) => {
        const dataToAdd = { 
          userId: selectedtransfer.userId, 
          sendingWalletRefrence: null, //Will be set later 
          receivingWalletRefrence: null,//Will be set later 
          currencyTo: selectedtransfer.currencyTo, 
          currencyFrom: selectedtransfer.currency, 
          amountToSend: selectedtransfer.amountToTransfer, 
          amountLeftToSend: selectedtransfer.amountToTransfer, 
          amountConverted: 0, 
          amountReceived: 0, 
          action: 'Exchange', 
          transactionStatus: 'New', 
          errorCode: 0,
          createdAt: Timestamp.now(), 
          exchangeFinished: false, 
          timeToFinishExchange:  new Date(Date.now() + 24 * 60 * 60 * 1000), 
          askedExchangeType: "Community", 
          finalizedTransactionDate: null,
        };
        console.log("");
        console.log("");
        console.log("");
        console.log("");
        console.log("");
        console.log("Transfer Demo Request");
        console.log(dataToAdd);
        console.log("");
        console.log("");
        console.log("");
        console.log("");
        console.log("");
        createNewTransfer(dataToAdd,admin,selectedtransfer.userId);
        trackEvent(selectedtransfer.userId,       
            {
                "name": "createTransactionDemoRequests",
                "params": {
                    dataToAdd,
                }
            }
        );
      });
      context.status(201).send({ message: 'createTransactionDemoRequests Success' });
    }catch(error){
      console.error(error);
      context.status(500).send({ message: 'createTransactionDemoRequests Error' });
    }
    });    
//Shuffel Array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
// function to balance requests
function balanceRequests(req1,req2,amount1,amount2,currentCurrency) 
{
    req1.amountConverted = amount1;
    req2.amountConverted = amount2;
    req1.amountReceived = amount2*currentCurrency;
    req2.amountReceived = amount1*(1/currentCurrency);
}

async function sendPN(fcmToken,payload)
{
    const message = {
        notification: {
            title: payload.title,
            body: payload.body
        },
        data: {
            click_action: 'OPEN_ACTIVITY',
            target_page: payload.page_id,
          },
        token: fcmToken
      };
    
      // maybe use getMessaging(app) ?
      return admin.messaging().send(message)
        .then(() => {
          console.log('Push notification sent successfully');
          return null;  // Return null or a specific value if needed
        })
        .catch((error) => {
          console.error('Error sending push notification:', error);
          throw new Error('Push notification failed'); // Throw an error to handle it further
        });
}

function getfcmToken(userId)
{

    // Get the user document from Firestore
    const userDoc = admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
      console.log(`User document not found for user ID: ${userId}`);
      return null;
    }
  
    // Get the FCM token from the user document
    const fcmToken = userDoc.data().fcmToken;
    if (!fcmToken) {
      console.log(`FCM token not found for user ID: ${userId}`);
      return null;
    }
    return fcmToken;
}

function matchTransferUtil()
{  
    console.log("Keep till production timestamp issue is sorted, Firestore admin:"+Timestamp.now());
    // Get the current timestamp
    const now = Timestamp.now();

    // Calculate the timestamp for 24 hours ago
    const yesterday = new Timestamp(now.seconds - 24 * 60 * 60, 0);

    // Calculate the timestamp for 10 seconds ago
    const tenSecondsAgo = new Timestamp(now.seconds - 10, 0);

    // Query the "transactionrequest" collection
    firestore.collection('transferRequests')
    .where('createdAt', '>=', yesterday)//***Change to finalize date
    .where('createdAt', '<=', tenSecondsAgo)
    .where('askedExchangeType','==','Community')
    .where('exchangeFinished', '==',false)
    .orderBy('createdAt')
    .get()
    //action = community
    //transction exchange
    //transaction exchange still open
    .then((snapshot) => {
      // Group the documents by currency field
        const documentsByCurrency = snapshot.docs.reduce((acc, doc) => {
        const currencyTo = doc.data().currencyTo;
        const currencyFrom = doc.data().currencyFrom;
        if (!acc[`${currencyTo}-${currencyFrom}`]) {
            acc[`${currencyTo}-${currencyFrom}`] = [];
        }
        var docWithId = doc.data();
        docWithId.id = doc.id;
        acc[`${currencyTo}-${currencyFrom}`].push(docWithId);
        return acc;
        }, {});
        let requestsStack2db = [];
        let microRequestsStack2db = [];
        for(pair in documentsByCurrency){
          const stack = documentsByCurrency[pair];
          let [currencyFrom, currencyTo] = pair.split('-');
          let oppositePair = `${currencyTo}-${currencyFrom}`;
          let oppositeStack = documentsByCurrency[oppositePair];// if null then don't run this ang go directly to spot
          if(stack.userId === oppositeStack.userId)//Edge case where the same user asked two opposite exchanges for diffeert amounts
          {
            //We don't want to exchange money for the same user between their wallets
            continue;
          }
          while(oppositeStack != null && stack.length > 0 && oppositeStack.length > 0){
            var currentCurrency = getExchangeRate(currencyFrom,currencyTo,firestore);
            let request1 = stack[stack.length-1];
            let request2 = oppositeStack[oppositeStack.length-1];
            let amount1 = request1.amountLeftToSend;
            let amount2 = request2.amountLeftToSend;
            console.log("Here are the requests:");
            console.log(request1,request2,amount1,amount2);

            if(amount1 === amount2*currentCurrency){
              // perform transfers
              // transfer from user1 in currencyFrom to user2 in currencyTo
              // transfer from user2 in currencyTo to user1 in currencyFrom
              request1.amountLeftToSend=0;
              request2.amountLeftToSend=0;
              request1.exchangeFinished= true; 
              request2.exchangeFinished= true; 
              console.log("Request 1 == Request 2");
              balanceRequests(request1,request2,amount1,amount2,currentCurrency);
              stack.pop();
              oppositeStack.pop();
              microRequestsStack2db.push({userId1:request1.userId,userId2:request2.userId,currencyFrom1:request1.currencyFrom,currencyFrom2:request2.currencyFrom,amountLeftToSend1:request1.amountLeftToSend,amountLeftToSend2:request2.amountLeftToSend});
              requestsStack2db.push(request1);
              requestsStack2db.push(request2);
              console.log();
            }
            else if(amount1 > amount2*currentCurrency){
              // perform partial transfers and update request1
              // transfer from user1 in currencyFrom to user2 in currencyTo
              // transfer from user2 in currencyTo to user1 in currencyFrom
              // remove request2 from oppositeStack
              // update request1 with the remaining amount
              request2.amountLeftToSend=0;
              request2.exchangeFinished= true; 
              console.log("Request 1 is bigger");
              balanceRequests(request1,request2,amount1,amount2,currentCurrency);
              microRequestsStack2db.push({userId1:request1.userId,userId2:request2.userId,currencyFrom1:request1.currencyFrom,currencyFrom2:request2.currencyFrom,amountLeftToSend1:request1.amountLeftToSend,amountLeftToSend2:request2.amountLeftToSend});
              oppositeStack.pop();
              requestsStack2db.push(request2);
              request1.amountLeftToSend = amount1 - amount2*currentCurrency;
              console.log();
            }
            else { // amount1 < amount2
              // perform partial transfers and update request2
              // transfer from user1 in currencyFrom to user2 in currencyTo
              // transfer from user2 in currencyTo to user1 in currencyFrom
              // remove request1 from stack
              // update request2 with the remaining amount
              request1.amountLeftToSend=0;
              request1.exchangeFinished= true; 
              console.log("Request 2 is bigger");
              balanceRequests(request1,request2,amount1,amount2,currentCurrency);
              microRequestsStack2db.push({userId1:request1.userId,userId2:request2.userId,currencyFrom1:request1.currencyFrom,currencyFrom2:request2.currencyFrom,amountLeftToSend1:request1.amountLeftToSend,amountLeftToSend2:request2.amountLeftToSend});
              stack.pop();
              requestsStack2db.push(request1);
              request2.amountLeftToSend = amount2 - amount1*(1/currentCurrency);
              console.log();
            }
           /* trackEvent(userId,       
                {
                    "name": "matchTransferUtil",
                    "params": {
                        request1,request2,
                    }
                }
            );*/
           }
        }
        bulkCreateOrUpdateTransactions(firestore,microRequestsStack2db,'intraTransaction'); 
        bulkCreateOrUpdateTransactions(firestore,requestsStack2db,'transferRequests');

    })
    .catch((error) => {
        console.error(error);
    });

}

exports.createCurrencies = functions.https.onRequest(async (data, context) => {
try {
    // Verify if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  addCurrencies(firestore);
  context.status(201).send({ message: 'createCurrencies Success' });
}catch (error) {
  console.error("An error occurred: ", error.message);
  context.status(500).send({ message: 'createCurrencies Error' });
  }});

async function updateWallet(data)
{
  // Verify data is valid
  const { balanceId, currency, amount } = data;
  if (!balanceId || !currency || !amount) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing or invalid data.');
  }

  // Update user's wallet in Firestore
  const balanceRef = admin.firestore().collection('users').doc(context.auth.uid).collection('wallets').doc(id);
  const balanceDoc = await balanceRef.get();
  if (!balanceDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Balance not found.');
  }
  const updatedBalance = balanceDoc.data()[currency] + amount;
  await balanceRef.update({ [currency]: updatedBalance });
  return { success: true };
};


exports.createTestUsers = functions.https.onRequest((request, response) => {
try {
    // Verify if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
}catch (error)
{
    console.error("An error occurred: ", error.message);
    context.status(500).send({ message: 'createTestUsers Error' });
}
});

exports.updateRates = functions.pubsub.schedule("every 24 hours").onRun((context) => {
  try {
    console.log("Running rates");
    fetchAndUpdateExchangeRates(admin);
    context.status(201).send({ message: 'Update Currencies Every 24 hours Success' });
}catch (error) {
  console.error(error);
  context.status(500).send({ message: 'Update Currencies Every 24 hours Success' });
  }}
);


/*
function matchTransfers()
{
    let transferRequests = new Map();
    let currencies = ['USD', 'EUR', 'ILS'];
    for(let i = 0; i < currencies.length; i++){
        for(let j = i+1; j < currencies.length; j++){
            let pair = `${currencies[i]}-${currencies[j]}`;
            transferRequests.set(pair, []);
        }
    }
    balanceTransfers();
}
*/
