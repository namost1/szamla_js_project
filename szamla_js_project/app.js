import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import {
  getClients,
  getBuyers,
  getInvoices,
  saveInvoice,
  stornoInvoice,
  addClient,
  addBuyer,
  updateClient,
  updateBuyer,
  deleteClient,
  deleteBuyer
} from './util/database.js';

const app = express();
app.use(express.static('public'));
const port = 8080;

app.use(cors());
app.use(bodyParser.json());

app.get('/clients', (req, res) => {
    res.json(getClients());
});

app.post('/clients', (req, res) => {
    addClient(req.body);
    res.status(201).send();
});

app.put('/clients/:id', (req, res) => {
    const client = { ...req.body, id: parseInt(req.params.id) };
    updateClient(client);
    res.status(200).send();
});

app.delete('/clients/:id', (req, res) => {
    deleteClient(parseInt(req.params.id));
    res.status(200).send();
});

app.get('/buyers', (req, res) => {
    res.json(getBuyers());
});

app.post('/buyers', (req, res) => {
    addBuyer(req.body);
    res.status(201).send();
});

app.put('/buyers/:id', (req, res) => {
    const buyer = { ...req.body, id: parseInt(req.params.id) };
    updateBuyer(buyer);
    res.status(200).send();
});

app.delete('/buyers/:id', (req, res) => {
    deleteBuyer(parseInt(req.params.id));
    res.status(200).send();
});

app.get('/invoices', (req, res) => {
    res.json(getInvoices());
});

app.post('/invoices', (req, res) => {
    try {
        saveInvoice(req.body);
        res.status(201).send();
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.post('/invoices/:id/storno', (req, res) => {
    stornoInvoice(parseInt(req.params.id));
    res.status(200).send();
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
