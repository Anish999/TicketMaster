const express = require ('express');
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
// var ObjectID = mongodb.ObjectID;
const app = express();

var TICKETS_COLLECTION = "tickets";

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

    // var server = app.listen(process.env.PORT || 8080, function(){
    //     var port = server.address().port;
    //     console.log("App now running on port", port);
    // });
});

// var tickets =[ {id:1, name: "Anish", assignee_id:1, status:"open"},
//                 {id:2, name: "Krishna", assignee_id:1, status:"open"},
//                 {id:3, name: "Bikash", assignee_id:1, status:"open"},
//                 {id:4, name: "Mosh", assignee_id:1, status:"open"}]

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
    // const t = tickets.find(c => c.id === parseInt(req.params.id))
    // if(!t) res.status(404).send('Ticket does not exist.');
    // res.send(t)
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
    var newTicket = req.body;
    
    if(!req.body.name || !req.body.status ){
        handleError(res, 'Fields cannot be empty','Please enter all the properties',400);
    }
    else{
        db.collection(TICKETS_COLLECTION).insertOne(newTicket, function(err, doc){
            if (err) {
                handleError(res, err.message, "Failed to create new ticket.");
            }
            else{
                res.status(201).json(doc.ops[0]);
            }
        });
    }

    // if(req.body.name.length < 2){
    //     req.status(400).send('Name should be at least 3 letters or more.');
    //     return;
    // }

    // const t = {
    //     id: tickets.length + 1,
    //     name: req.body.name,
    //     assignee_id: req.body.assignee_id,
    //     status: req.body.status
    // };

    // tickets.push(t);
    // res.send(t);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}...`));

function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({"error": message});
  }