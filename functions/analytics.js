const fetch = require('node-fetch');
/*
async function trackEvent(eventData) {
  const measurementId = 'G-MQ93WKVNFH';
  const apiKey = 'RdddeAYoR2ixuHCDauSSyg';

  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiKey}`;
  const body = {*/
 /*   v: '1', // version
    t: 'event', // hit type
    tid: measurementId, // measurement id
    cid: '123', // user id or client id
    ec: 'test',//eventData.category, // event category
    ea: 'test',//eventData.action, // event action
    el: 'test',//eventData.label, // event label
    ev: 'test'//eventData.value, // event value*/
/*
    "client_id":"11111",
    "user_id":"111111",
    "timestamp_micros":"1683201653845000",
    "non_personalized_ads":false,
    "events":[
    {
        "name":"add_payment_info",
        "params":
        {
            "coupon":"Summer",
            "currency":"USD",
            "payment_type":"Credy",
            "value":234
        }
    }
    ]
  };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PostmanRuntime/7.31.3'
      },
      body: new URLSearchParams(body),
    });
    
    console.log('Analytics event tracked:', eventData);
    console.log('Response:', await response.text());
  } catch (error) {
    console.error('Failed to track analytics event:', error);
  }
}
*/

async function trackEvent(userId,events) {
  /*  eventPush =  JSON.stringify({
      "client_id": "12345678.87654321",
      "user_id": userId,
      "events": [events]
  })*/
  eventPush =  JSON.stringify({
    "client_id": "1234567127654321",
    "user_id": "6797667",//userId,
    "events": [events]
})
    console.log(eventPush); 
    fetch('https://www.google-analytics.com/mp/collect?measurement_id=G-MQ93WKVNFH&api_secret=RdddeAYoR2ixuHCDauSSyg', {
    method: "POST",
    headers: {
        'Content-Type': 'application/json'
    },
    body:  JSON.stringify( {"client_id": "12345678.87654321",
    "user_id": userId,
    "events": [{
    "name": "follow_me_at_tiktok",
    "params": {
        "twitter_handle": "@thyng",
        "value": 7.77,
    }},{
    "name": "follow_intent",
    "params": {
        "status": "success"
    }}]})
    }); 
}
module.exports = {
    trackEvent
  };


