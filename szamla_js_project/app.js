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

app.delete('/api/clients/:id', async (req, res) => {
    try {
        await deleteClient(req.params.id);
        res.sendStatus(204);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
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

app.delete('/api/buyers/:id', async (req, res) => {
    try {
        await deleteBuyer(req.params.id);
        res.sendStatus(204);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/api/invoices', (req, res) => {
    try {
        saveInvoice(req.body);
        res.status(201).send();
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.post('/api/invoices/storno/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    stornoInvoice(id);
    res.json({ success: true, message: 'Számla sikeresen stornózva.' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/invoices', (req, res) => {
  const invoices = getInvoices();
  res.json(invoices);
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
