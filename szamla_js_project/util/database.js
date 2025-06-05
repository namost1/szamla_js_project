import Database from "better-sqlite3";

const db = new Database('./data/database.sqlite');

db.exec(`
CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    taxNumber TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS buyers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    taxNumber TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clientId INTEGER NOT NULL,
    buyerId INTEGER NOT NULL,
    invoiceNumber TEXT NOT NULL,
    issueDate TEXT NOT NULL,
    fulfillmentDate TEXT NOT NULL,
    paymentDeadline TEXT NOT NULL,
    totalAmount REAL NOT NULL,
    vatPercent INTEGER NOT NULL,
    isStorno INTEGER DEFAULT 0,
    clientName TEXT NOT NULL,
    clientAddress TEXT NOT NULL,
    clientTaxNumber TEXT NOT NULL,
    buyerName TEXT NOT NULL,
    buyerAddress TEXT NOT NULL,
    buyerTaxNumber TEXT NOT NULL,
    FOREIGN KEY (clientId) REFERENCES clients(id),
    FOREIGN KEY (buyerId) REFERENCES buyers(id)
);
`);

const clientCount = db.prepare('SELECT COUNT(*) AS count FROM clients').get().count;
if (clientCount === 0) {
    const insert = db.prepare('INSERT INTO clients (name, address, taxNumber) VALUES (?, ?, ?)');
    insert.run('Kiállító1', '1111 Budapest, Fő utca 1.', '11111111-1-11');
    insert.run('Kiállító2', '1111 Budapest, Fő utca 2.', '11111111-1-12');
    insert.run('Kiállító3', '1111 Budapest, Fő utca 3.', '11111111-1-13');
}

const buyerCount = db.prepare('SELECT COUNT(*) AS count FROM buyers').get().count;
if (buyerCount === 0) {
    const insert = db.prepare('INSERT INTO buyers (name, address, taxNumber) VALUES (?, ?, ?)');
    insert.run('Vevő1', '1111 Budapest, Fő utca 4.', '11111111-1-14');
    insert.run('Vevő2', '1111 Budapest, Fő utca 5.', '11111111-1-15');
    insert.run('Vevő3', '1111 Budapest, Fő utca 6.', '11111111-1-16');
}

const invoiceCount = db.prepare('SELECT COUNT(*) AS count FROM invoices').get().count;
if (invoiceCount === 0) {
    const clients = db.prepare('SELECT * FROM clients').all();
    const buyers = db.prepare('SELECT * FROM buyers').all(); 
    const insertInvoice = db.prepare(`
        INSERT INTO invoices (
            clientId, buyerId, invoiceNumber,
            issueDate, fulfillmentDate, paymentDeadline,
            totalAmount, vatPercent,
            clientName, clientAddress, clientTaxNumber,
            buyerName, buyerAddress, buyerTaxNumber
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    clients.forEach(client => {
        buyers.forEach(buyer => {
            for (let i = 1; i <= 3; i++) {
                const issueDate = randomDate('2024-01-01', 60);
                const fulfillmentDate = issueDate;
                const paymentDeadline = randomDate(issueDate, 30);
                const totalAmount = Math.floor(Math.random() * 50000 + 10000);
                const vatPercent = 27;
                const invoiceNumber = `${client.id}-${buyer.id}-${new Date().getFullYear()}-${String(i).padStart(3, '0')}`;

                insertInvoice.run(
                    client.id,
                    buyer.id,
                    invoiceNumber,
                    issueDate,
                    fulfillmentDate,
                    paymentDeadline,
                    totalAmount,
                    vatPercent,
                    client.name,
                    client.address,
                    client.taxNumber,
                    buyer.name,
                    buyer.address,
                    buyer.taxNumber
                );
            }
        });
    });
}

function randomDate(startDateStr, rangeDays) {
    const startDate = typeof startDateStr === 'string' ? new Date(startDateStr) : new Date(startDateStr);
    const date = new Date(startDate);
    date.setDate(date.getDate() + Math.floor(Math.random() * rangeDays));
    return date.toISOString().split('T')[0];
}

export const getClients = () => db.prepare('SELECT * FROM clients').all();

export const getBuyers = () => db.prepare('SELECT * FROM buyers').all();

export const getInvoices = () => {
    return db.prepare(`
        SELECT invoices.*, 
               ROUND(totalAmount * vatPercent / 100.0, 2) AS vatAmount,
               ROUND(totalAmount * (1 + vatPercent / 100.0), 2) AS grossAmount
        FROM invoices
        ORDER BY invoices.id DESC
    `).all();
};

export const saveInvoice = (invoice) => {
    const issueDate = new Date(invoice.issueDate);
    const paymentDeadline = new Date(invoice.paymentDeadline);
    const diffDays = (paymentDeadline - issueDate) / (1000 * 60 * 60 * 24);
    if (diffDays > 30) {
        throw new Error('A fizetési határidő nem lehet több, mint 30 nap a kiállítás dátumától számítva.');
    }

    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(invoice.clientId);
    const buyer = db.prepare('SELECT * FROM buyers WHERE id = ?').get(invoice.buyerId);
    const invoiceCount = db.prepare('SELECT COUNT(*) AS count FROM invoices WHERE clientId = ?').get(invoice.clientId).count;
    const invoiceNumber = `${client.id}-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(3, '0')}`;

    return db.prepare(`
        INSERT INTO invoices 
        (clientId, buyerId, invoiceNumber, issueDate, fulfillmentDate, paymentDeadline, totalAmount, vatPercent,
         clientName, clientAddress, clientTaxNumber, buyerName, buyerAddress, buyerTaxNumber)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        invoice.clientId,
        invoice.buyerId,
        invoiceNumber,
        invoice.issueDate,
        invoice.fulfillmentDate,
        invoice.paymentDeadline,
        invoice.totalAmount,
        invoice.vatPercent,
        client.name,
        client.address,
        client.taxNumber,
        buyer.name,
        buyer.address,
        buyer.taxNumber
    );
};

export const stornoInvoice = (id) => {
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
  if (!invoice) throw new Error('A számla nem található.');

  if (invoice.isStorno === 1) throw new Error('A számla már stornózva van.');

  db.prepare('UPDATE invoices SET isStorno = 1 WHERE id = ?').run(id);
};



export const addClient = (client) => {
    db.prepare('INSERT INTO clients (name, address, taxNumber) VALUES (?, ?, ?)').run(client.name, client.address, client.taxNumber);
};

export const updateClient = (client) => {
    db.prepare('UPDATE clients SET name = ?, address = ?, taxNumber = ? WHERE id = ?').run(client.name, client.address, client.taxNumber, client.id);
};

export const deleteClient = (id) => {
    db.prepare('DELETE FROM clients WHERE id = ?').run(id);
};

export const addBuyer = (buyer) => {
    db.prepare('INSERT INTO buyers (name, address, taxNumber) VALUES (?, ?, ?)').run(buyer.name, buyer.address, buyer.taxNumber);
};

export const updateBuyer = (buyer) => {
    db.prepare('UPDATE buyers SET name = ?, address = ?, taxNumber = ? WHERE id = ?').run(buyer.name, buyer.address, buyer.taxNumber, buyer.id);
};

export const deleteBuyer = (id) => {
    db.prepare('DELETE FROM buyers WHERE id = ?').run(id);
};
