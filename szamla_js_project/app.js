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

// Minden útvonal /api prefix-szel
app.get('/api/clients', (req, res) => {
    res.json(getClients());
});

app.post('/api/clients', (req, res) => {
    addClient(req.body);
    res.status(201).send();
});

app.put('/api/clients/:id', (req, res) => {
    const client = { ...req.body, id: parseInt(req.params.id) };
    updateClient(client);
    res.status(200).send();
});

app.delete('/api/clients/:id', (req, res) => {
    deleteClient(parseInt(req.params.id));
    res.status(200).send();
});

app.get('/api/buyers', (req, res) => {
    res.json(getBuyers());
});

app.post('/api/buyers', (req, res) => {
    addBuyer(req.body);
    res.status(201).send();
});

app.put('/api/buyers/:id', (req, res) => {
    const buyer = { ...req.body, id: parseInt(req.params.id) };
    updateBuyer(buyer);
    res.status(200).send();
});

app.delete('/api/buyers/:id', (req, res) => {
    deleteBuyer(parseInt(req.params.id));
    res.status(200).send();
});

app.get('/api/invoices', (req, res) => {
    res.json(getInvoices());
});

app.post('/api/invoices', (req, res) => {
    try {
        saveInvoice(req.body);
        res.status(201).send();
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.post('/api/invoices/:id/storno', (req, res) => {
    stornoInvoice(parseInt(req.params.id));
    res.status(200).send();
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
