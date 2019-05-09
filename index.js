const express = require ('express');
const bodyParser = require("body-parser");
const mongodb = require("mongodb");
const js2xmlparser = require('js2xmlparser');
const fetch = require('node-fetch');
const xmlparser = require('express-xml-bodyparser');
const app = express();

var url = "https://ticket-cs415.herokuapp.com"

var TICKETS_COLLECTION = "tickets";

app.use(xmlparser());

app.use(bodyParser.json());

app.use(express.json());

var db;

mongodb.MongoClient.connect(process.env.MONGODB_URI || "mongodb+srv://Anish999:Anish123@phase2-415-n2ctl.mongodb.net/test?retryWrites=true", {useNewUrlParser: true},function(err, client){
    if (err) {
        console.log(err);
        process.exit(1);
    }
    else{

        db = client.db('test');
        console.log("Database connection ready");
    }
});



app.get('/', (req, res) => {
    res.send(`Welcome to Shady's World.`);
});

app.get('/rest/list', (req, res) => {
   // res.send(tickets);
   db.collection(TICKETS_COLLECTION).find({}).toArray(function(err, docs){
       if(err){
           handleError(res,err.message, "Failed to get tickets.");
       }
       else{
           res.status(200).json(docs);
       }
   });
});

app.get('/rest/ticket/:id', (req, res)=>{
    
    db.collection(TICKETS_COLLECTION).findOne({id: req.params.id}, function(err, doc){
        if(err){
            handleError(res, err.message, "Failed to get ticket.");
        }
        else{
            res.status(200).json(doc);
        }
    });
});

app.put("/rest/ticket/:id", function(req, res) {

    db.collection(TICKETS_COLLECTION).findOne({id: req.params.id}, function(err, doc){
        if (doc == null){
            res.send("No tickets with such Id exists");
        }
        else {
            db.collection(TICKETS_COLLECTION).updateOne({id: req.params.id}, { $set: req.body});
            res.status(200).json(req.body);
        }
    });
  
});

  app.delete("/rest/ticket/:id", function(req, res) {
    db.collection(TICKETS_COLLECTION).deleteOne({id: req.params.id}, function(err, result) {
      if (err) {
        handleError(res, err.message, "Failed to delete contact");
      } else {
        res.status(200).json(req.body);
      }
    })
  });

app.post('/rest/ticket', (req, res) => {

    var x = null;
    var newTicket = req.body;

    db.collection(TICKETS_COLLECTION).findOne({id: newTicket.id}, function(err, doc){
        if (doc != null){
            handleError(res, 'Already exists','Try again',400);
        }
        else {
            db.collection(TICKETS_COLLECTION).insertOne(newTicket, function(err, doc){
                if (err) {
                    handleError(res, err.message, "Failed to create new ticket.");
                }
                else{
                    res.status(201).json(doc.ops[0]);
                }
            });
        }
    });
    
    
});
app.get('/rest/xml/ticket/:id', (req, res)=>{
    fetch(url + "/rest/ticket/" + req.params.id)
    .then(response => response.json())
    .then(body =>{
        res.send(js2xmlparser.parse("ticket", body));
    });
    
});

app.post('/rest/xml/ticket', function(req, res){
   // console.log(req.body.ticket);
   fetch(url+"/rest/ticket",{
       method: 'POST',
       body:JSON.stringify(req.body.ticket),
       headers: {'Content-Type': 'application/json'},
    })
    .then(response => response.json())
    .then(json => res.send(json));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}...`));

function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({"error": message});
  }