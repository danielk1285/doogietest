const { error } = require("firebase-functions/logger");
const {  Timestamp } = require('firebase-admin/firestore');

const currenciesData = {
  "USD": {
    "symbol": "$",
    "name": "US Dollar",
    "symbol_native": "$",
    "decimal_digits": 2,
    "rounding": 0,
    "code": "USD",
    "name_plural": "US dollars",
    "flag":"/currencyFlags/flag_usa.png"
  },
  "EUR": {
    "symbol": "€",
    "name": "Euro",
    "symbol_native": "€",
    "decimal_digits": 2,
    "rounding": 0,
    "code": "EUR",
    "name_plural": "euros",
    "flag":"/currencyFlags/flag_european_union.png"
  },
  "ILS": {
    "symbol": "₪",
    "name": "Israeli New Sheqel",
    "symbol_native": "₪",
    "decimal_digits": 2,
    "rounding": 0,
    "code": "ILS",
    "name_plural": "Israeli new sheqels",
    "flag":"/currencyFlags/flag_israel.png"
  },
  "GBP": {
    "symbol": "£",
    "name": "British Pound Sterling",
    "symbol_native": "£",
    "decimal_digits": 2,
    "rounding": 0,
    "code": "GBP",
    "name_plural": "British pounds sterling",
    "flag":"/currencyFlags/flag_united_kingdom.png"
  }
};


async function bulkCreateOrUpdateTransactions(firestore,transactions,collection) 
{
  const batch = firestore.batch();
  for (const transaction of transactions) {
    var transactionDocRef;
    if(transaction.id !==undefined)
    {
      transactionDocRef = firestore.collection(collection).doc(transaction.id);
    }
    else
    {
      transactionDocRef = firestore.collection(collection).doc();
    }
    batch.set(transactionDocRef, 
      transaction
    , { merge: true });
  }

  await batch.commit();

  return { success: true };
}


// Create or update an intra-transaction document
async function createOrUpdateIntraTransaction(firestore,intraTransaction)  
{  
    const {id, party1TransactionRefrence, party2TransactionRefrence, party1Receives,party2Receives,subAmount,transactionType} = intraTransaction
    // Create or update the intra-transaction document in Firestore
    await firestore.collection('IntraTransaction').doc(id.toString()).set({
      id,
      party1TransactionRefrence,
      party2TransactionRefrence,
      party1Receives,
      party2Receives,
      subAmount,
      transactionType,
    }, { merge: true });
  
    // Return a success response
    return { success: true };
};

// Create or update a transaction request document
async function createOrUpdateTransactionRequest(firestore,transactionRequest)
{
  // Extract data from the request 
  const { userRefrenceId, sendingWalletRefrence, receivingWalletRefrence, sendingBankRefernce, receivingBankRefernce, currencySent, currencyReceived, amountToSend, amountConverted, amountToReceive, amountReceived, action, transactionStatus, errorCode, readyForWithdrawl, timeToFinishExchange, askedExchangeType, finalizedTransactionDate } = transactionRequest;
  // Create or update the transaction request document in Firestore
  await firestore.collection('TransactionRequests').doc(userRefrenceId.toString()).set({
    userRefrenceId,
    sendingWalletRefrence,
    receivingWalletRefrence,
    sendingBankRefernce,
    receivingBankRefernce,
    currencySent,
    currencyReceived,
    amountToSend,
    amountConverted,
    amountToReceive,
    amountReceived,
    action,
    transactionStatus,
    errorCode,
    readyForWithdrawl,
    timeToFinishExchange: timeToFinishExchange ? admin.firestore.Timestamp.fromDate(new Date(timeToFinishExchange)) : null,
    askedExchangeType,
    finalizedTransactionDate: finalizedTransactionDate ? admin.firestore.Timestamp.fromDate(new Date(finalizedTransactionDate)) : null,
  }, { merge: true });

  // Return a success response
  return { success: true };
};

// Create activity document
async function createNewActivity(firestore,activity)
{
  const activityRef = await firestore.collection('activity').add(activity);
  return activityRef;
};

async function bulkCreateOrUpdateUsers(firestore,users)
{
  const batch = firestore.batch();
  for (const user of users) {
    const testUserRequestDocRef = firestore.collection('users').doc(user.username.toString());
    batch.set(testUserRequestDocRef,user, { merge: true });
  }

  await batch.commit().then(() => {
    console.log("Documents successfully written!");
  })
  .catch((error) => {
    console.error("Error writing document: ", error);
    return { error:true }
  });;

  return { success: true };
}

async function bulkCreateOrUpdateTransactionRequests(firestore,transactionRequests)
{
  
    const batch = firestore.batch();
  
    for (const transactionRequest of transactionRequests) {
      const { id, userReferenceId, sendingWalletRefrence, receivingWalletRefrence, sendingBankRefernce, receivingBankRefernce, currencySent, currencyReceived, amountToSend, amountConverted, transactionStatus, readyForWithdrawl, timeToFinishExchange, askedExchangeType, finalizedTransactionDate } = transactionRequest;
  
      const transactionRequestDocRef = firestore.collection('TransactionRequests').doc(id.toString());
      batch.set(transactionRequestDocRef, {
        id,
        user: { referenceId: userReferenceId },
        sendingWalletRefrence,
        receivingWalletRefrence,
        sendingBankRefernce,
        receivingBankRefernce,
        currencySent,
        currencyReceived,
        amountToSend,
        amountConverted,
        transactionStatus,
        readyForWithdrawl,
        timeToFinishExchange: new Date(timeToFinishExchange),
        askedExchangeType,
        finalizedTransactionDate: finalizedTransactionDate ? new Date(finalizedTransactionDate) : null,
      }, { merge: true });
    }
  
    await batch.commit();
  
    return { success: true };
  };
 //Util function to create test users 
  function randomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  //Function to create fake users
  function createTestUser()
  {
    const user = {
      id: Math.floor(Math.random() * 10000000000),
      userid: Math.floor(Math.random() * 10000000000),
      username: "test_user_"+randomString(10),
      businessorPersonalAccount: Math.random() >= 0.5,
      firstName: randomString(8),
      lastName: randomString(10),
      email: `${randomString(8)}@${Math.random() >= 0.5 ? 'outlook' : 'yahoo'}.com`,
      authParty: ['fb', 'google', 'apple'][Math.floor(Math.random() * 3)],
      rfreshToken: randomString(15),
      phone: Math.floor(Math.random() * 10000000000),
      kycVerified: ['Approved', 'Pending', 'Not Verified', 'Failed'][Math.floor(Math.random() * 4)],
      userVerificationCred: {
        IP: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
        Date: new Date(),
        Time: new Date().getTime()
      },
      kycAddressLine1: randomString(15),
      kycAddressLine2: randomString(20),
      kycCity: randomString(10),
      kycState: randomString(10),
      kycZipcode: Math.floor(Math.random() * 100000),
      kycCountry: randomString(10),
      kycIDType: ['ID', 'License', 'Passport'][Math.floor(Math.random() * 3)],
      kycIdentificationLink: `https://${randomString(15)}.com`,
      home_address_confirmation_type: randomString(10),
      kycHomeAddressConfirmationLink: `https://${randomString(15)}.com`,
      birthday: new Date('1995-01-01'),
      language: ['English', 'Spanish', 'French'][Math.floor(Math.random() * 3)],
      userImage: `https://${randomString(15)}.com`,
      delete_or_archive_user: [0, 1, 2][Math.floor(Math.random() * 3)],
      BankAccounts: generateRandomNumberOfObjects(createRandomBankAccount),
      Wallets:     removeDuplicateWallets(generateRandomNumberOfObjects(createRandomWallet)),
      UserSettings: {
        notifications: Math.random() >= 0.5,
        language: ['English', 'Spanish', 'French'][Math.floor(Math.random() * 3)],
        darkMode: Math.random() >= 0.5,
        currency: ['USD', 'EUR', 'ILS'][Math.floor(Math.random() * 3)],
      },
      Businesses: generateRandomNumberOfObjects(createRandomBusiness),
    };
    return user;
  }
  function isValidEmail(email) {
    // Regular expression pattern for email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    return emailPattern.test(email);
  }
  function validateUser(user){
    //Must fields
    if(typeof user.id != 'string' || typeof user.username != 'string' || typeof user.email != 'string' || !isValidEmail(user.email) ||
    !['fb', 'google', 'apple'].includes(user.authParty) || typeof user.rfreshToken != 'string')
    {
      return false;
    }
    return true;
  }
// Function to add user document to Firebase
async function addUserToFirebase(id,user,firestore)
{
  try {
    user.id= id;
    var userDocRef = firestore.collection('users').doc();
    await userDocRef.set(user).then(()=>{
      console.log("Added new user");
    });
  } catch (error) {
    console.error('Error adding user to Firebase:', error);
  }
}
// Function to update user document with subcollections to Firebase
async function updateUserInFirebase(id,docId,user,firestore) {
  try {
    if(user.id != id)
    {
      console.log("For user ID "+ user.id+" User id changed to:"+id);
      user.id = id;
    }
    
    var userDocRef = firestore.collection('users').doc(docId);
    await userDocRef.update(user);
  
 /*    
    // Add BankAccounts subcollection
    if(typeof user.bankAccounts!='undefined')
    {
      for (let i = 0; i < user.bankAccounts.length; i++) {
        await userRef.collection('BankAccounts').set(user.bankAccounts[i]);
      }
    }
    

    // Add Wallets subcollection
    if(typeof user.wallets!='undefined')
    {
      for (let i = 0; i < user.wallets.length; i++) {
        await userRef.collection('Wallets').update(user.wallets[i]);
      }
    }

    // Add UserSettings subcollection
    if(typeof user.userSettings!='undefined')
    {
      for (let i = 0; i < user.userSettings.length; i++) {
        await userRef.collection('UserSettings').update(user.userSettings[i]);
      }
    }
    // Add Businesses subcollection
    if(typeof user.businesses!='undefined')
    {
      for (let i = 0; i < user.businesses.length; i++) {
        await userRef.collection('Businesses').update(user.businesses[i]);
      }
    }
*/
    console.log(`User updated to Firebase with ID: ${id}`);
  } catch (error) {
    console.error('Error adding user to Firebase:', error);
  }
}


  async function createOrUpdateUser(id,data,firestore)
  {
    try{
    var user = data.body;  
    if(!validateUser(user))
    {
      console.log("Error");
      throw new error('invalid-argument', 'Missing or invalid data.');
    }
    firestore.collection("users")
  .where("id", "==", id)
  .limit(1)
  .get()
  .then((querySnapshot) => {
    if (!querySnapshot.empty) {
      // Update user in DB
        updateUserInFirebase(id,querySnapshot.docs[0].id,user,firestore).then(()=>{
        console.log("Finalized createOrUpdateUser");
      })
      console.log("Updating User");
    } else {
      // Document with the unique field value does not exist
      addUserToFirebase(id,user,firestore);
      console.log("Adding new user");
    }
  })
  .catch((error) => {
    console.error("Error querying Firestore:", error);
    throw error;
  });
   
    
  }catch(error)
  {
     throw error;  
  }
   
}


  
  
// This is used to manufacture a random number of wallets, businesses, bank accounts for testing
  function generateRandomNumberOfObjects(callback) {
    const numOfObjects = Math.floor(Math.random() * 10) + 1;
    const objects = [];
    for (let i = 0; i < numOfObjects; i++) {
      const object = callback();
      objects.push(object);
    }
    return objects;
  }

  function createRandomBankAccount() {
    const bankNames = ['Chase', 'Bank of America', 'Wells Fargo', 'Citibank'];
    const bankCountries = ['USA', 'Canada', 'UK', 'Germany'];
    const currencies = ['USD', 'EUR', 'GBP', 'CAD'];
    const verificationStatuses = ['NotVerified', 'Done', 'Pending', 'InProgress', 'Failed'];
    
    const id = Math.floor(Math.random() * 10000000000);
    const verificationStatus = verificationStatuses[Math.floor(Math.random() * verificationStatuses.length)];
    const userVerificationCred = { IP: '127.0.0.1', Date: new Date(), Time: new Date().getTime() };
    const verificationImageLink = `https://verificationimage.com/${id}`;
    const bankName = bankNames[Math.floor(Math.random() * bankNames.length)];
    const bankCountry = bankCountries[Math.floor(Math.random() * bankCountries.length)];
    const swift = `SWFT${Math.floor(Math.random() * 1000000000)}`;
    const iban = `IBAN${Math.floor(Math.random() * 1000000000)}`;
    const branchNumber = `BRN${Math.floor(Math.random() * 1000000000)}`;
    const bankAddress = `${Math.floor(Math.random() * 10000)} Main St`;
    const accountNumber = `ACCT${Math.floor(Math.random() * 1000000000)}`;
    const routingNumber = `RTRG${Math.floor(Math.random() * 1000000000)}`;
    const nickname = `${bankName} Account`;
    const accountCurrency = currencies[Math.floor(Math.random() * currencies.length)];
    const preferredCurrency = currencies[Math.floor(Math.random() * currencies.length)];
    
    return {
      id,
      verificationStatus,
      userVerificationCred,
      verificationImageLink,
      bankName,
      bankCountry,
      swift,
      iban,
      branchNumber,
      bankAddress,
      accountNumber,
      routingNumber,
      nickname,
      accountCurrency,
      preferredCurrency
    };
  }
  
  function createRandomBusiness() {
    const businessId = Math.floor(Math.random() * 1000000); // Generate a random business ID
    const kycStatuses = ['Approved', 'Pending', 'Not Verified', 'Failed']; // KYC status options
    const industries = ['Technology', 'Finance', 'Retail', 'Healthcare', 'Manufacturing']; // Industry options
    const states = ['NY', 'CA', 'TX', 'FL', 'IL']; // State options
    
    const business = {
      BusinessId: businessId,
      KYCVerified: kycStatuses[Math.floor(Math.random() * kycStatuses.length)], // Random KYC status
      UserVerificationCred: { IP: '192.168.1.1', Date: new Date(), Time: new Date().toLocaleTimeString() }, // Set static verification credentials
      KYC: {
        OrgName: `Acme Corporation ${businessId}`, // Unique organization name based on business ID
        IncorporationDate: new Date(new Date().getFullYear() - Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)), // Random incorporation date within last 20 years
        Role: 'CEO', // Set static role
        Industry: industries[Math.floor(Math.random() * industries.length)], // Random industry
        BusinessCountry: 'USA', // Set static country
        BusinessState: states[Math.floor(Math.random() * states.length)], // Random state
        BusinessCity: 'New York', // Set static city
        BusinessStreet: '123 Main St', // Set static street
        BusinessHouseNumber: `${Math.floor(Math.random() * 100)}`, // Random house number
        BusinessPostalNumber: `${Math.floor(Math.random() * 90000) + 10000}`, // Random 5-digit postal code
        CountryToTransferMoneyFrom: 'USA', // Set static country
        BusinessUSTaxResident: 'Yes', // Set static tax residency
        BusinessEIN: `${Math.floor(Math.random() * 900000000) + 100000000}` // Random 9-digit EIN
      }
    };
    
    return business;
  }
  
  function createRandomWallet() {
    const currencies = ['USD', 'EUR', 'ILS'];
    const randomCurrency = currencies[Math.floor(Math.random() * currencies.length)];
    const randomAmount = Math.floor(Math.random() * 10000) + 1; // generate a random amount between 1 and 10000
    const id = Math.floor(Math.random() * 1000000000); // generate a random 9-digit id
    return {
      id,
      currency: randomCurrency,
      amount: randomAmount,
    };
  }
//removes wallets with the same currency
  function removeDuplicateWallets(wallets) {
    const uniqueCurrencies = new Set();
    return wallets.filter(wallet => {
      if (uniqueCurrencies.has(wallet.currency)) {
        return false;
      } else {
        uniqueCurrencies.add(wallet.currency);
        return true;
      }
    });
  }
  
// This is used to manufacture a set number of objects for testing. Mainly create a set number of users.
function generateNumberOfObjects(numOfObjects,callback) {
  const objects = [];
  for (let i = 0; i < numOfObjects; i++) {
    const object = callback();
    objects.push(object);
  }
  return objects;
}
async function addNewWallet(userId, currency,admin) {
  const db = admin.firestore();
  const userRef = db.collection('users').doc(userId);

  // Check if the user already has a wallet for the given currency
  const walletsRef = userRef.collection('Wallets');
  const existingWalletSnapshot = await walletsRef.where('currency', '==', currency).limit(1).get();
  if (!existingWalletSnapshot.empty) {
    console.log(`User ${userId} already has a ${currency} wallet.`);
    console.log('users wallet:'+existingWalletSnapshot.docs[0].id);
    return existingWalletSnapshot.docs[0].id;
  }

  // If the user doesn't have a wallet for the given currency, add a new one
  const newWallet = {
    currency: currency,
    amount: 0
  };
  const result = await walletsRef.add(newWallet);
  console.log(`Added new ${currency} wallet to user ${userId}: ${result.id}`);
  return result.id;
}

async function addCurrencies(firestore)
{
  try {
    const currenciesRef = firestore.collection('currencies');
    await currenciesRef.doc('currencies').set(currenciesData);
    console.log('Currencies pushed to Firestore successfully');
  } catch (error) {
    console.error('Error pushing currencies to Firestore: ', error);
  }
}



// Export the utility function
module.exports = {
    bulkCreateOrUpdateTransactions,
    bulkCreateOrUpdateTransactionRequests,
    createOrUpdateIntraTransaction,
    createOrUpdateTransactionRequest,
    createTestUser,
    generateNumberOfObjects,
    bulkCreateOrUpdateUsers,
    addNewWallet,
    addCurrencies,
    createOrUpdateUser
  };

