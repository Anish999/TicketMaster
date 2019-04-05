const express = require ('express');
const app = express();

app.use(express.json());

var tickets =[ {id:1, name: "Anish", assignee_id:1, status:"open"},
                {id:2, name: "Krishna", assignee_id:1, status:"open"},
                {id:3, name: "Bikash", assignee_id:1, status:"open"},
                {id:4, name: "Mosh", assignee_id:1, status:"open"}]

app.get('/', (req, res) => {
    res.send(`Welcome to Shady's World`);
});

app.get('/rest/list', (req, res) => {
    res.send(tickets);
});

app.get('/rest/ticket/:id', (req, res)=>{
    const t = tickets.find(c => c.id === parseInt(req.params.id))
    if(!t) res.status(404).send('Ticket does not exist.');
    res.send(t)
});

app.post('/rest/ticket', (req, res) => {
    if(!req.body.name || !req.body.status || !req.body.assignee_id){
        req.status(400).send('Please enter all the properties');
        return;
    }

    if(req.body.name.length < 2){
        req.status(400).send('Name should be at least 3 letters or more.');
        return;
    }

    const t = {
        id: tickets.length + 1,
        name: req.body.name,
        assignee_id: req.body.assignee_id,
        status: req.body.status
    };

    tickets.push(t);
    res.send(t);
})

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}...`));

