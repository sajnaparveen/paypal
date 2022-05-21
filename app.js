const express = require('express');
const paypal = require('paypal-rest-sdk');
const port=process.env.port || 3000;     
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AUz_2JNRKPpgNEWyAyITkTx7Ef0HKIySmKs-yVFCBs6sEmJl36J_Rsw8FqqjzaHYcwWQ1mp6QPVEEpLv',
  'client_secret': 'EGKMwGCfFDVRip2i2eGyzmq1orMoTYB8Y9yKMicEw8kCYbgKuImDIRbSi2JREjNNzM5rOJ3iT1W3433F'
});
 
const app = express();
 
app.get('/', (req, res) => res.sendFile(__dirname + "/index.html"));
 app.post('/pay', (req, res) => {
  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:3000/success",
        "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "Red Sox Hat",
                "sku": "001",
                "price": "5.00",
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": "5.00"
        },
        "description": "Hat for the best team ever"
    }]
};
 
paypal.payment.create(create_payment_json, function (error, payment) {
  if (error) {
      throw error;
  } else {
      for(let i = 0;i < payment.links.length;i++){
        if(payment.links[i].rel === 'approval_url'){
          res.redirect(payment.links[i].href);
        }
      }
  }
});
 
});
app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
  
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": "5.00"
          }
      }]
    };
  
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          console.log(JSON.stringify(payment));
          res.send('Success');
      }
  });
  });
app.get('/cancel', (req, res) => res.send('Cancelled'));
app.listen(port, () => console.log(`Server Started on ${port}`));