const apiUrl = '/api';

let editingClientId = null;
let editingBuyerId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadClients();
    loadBuyers();
    loadInvoices();

    document.getElementById('add-client-form').addEventListener('submit', handleAddOrEditClient);
    document.getElementById('add-buyer-form').addEventListener('submit', handleAddOrEditBuyer);
    document.getElementById('add-invoice-form').addEventListener('submit', handleAddInvoice);
});

// === Kiállítók ===

function loadClients() {
    fetch(`${apiUrl}/clients`)
        .then(res => res.json())
        .then(clients => {
            const clientSelect = document.getElementById('invoice-client');
            const clientList = document.getElementById('clients-list');
            clientSelect.innerHTML = '';
            clientList.innerHTML = '<h3>Kiállítók</h3>';

            clients.forEach(client => {
                const option = document.createElement('option');
                option.value = client.id;
                option.textContent = client.name;
                clientSelect.appendChild(option);

                const div = document.createElement('div');
                div.innerHTML = `
                    <strong>${client.name}</strong><br>
                    ${client.address}<br>
                    ${client.taxNumber}<br>
                    <button data-id="${client.id}" class="edit-client">Módosítás</button>
                    <button data-id="${client.id}" class="delete-client">Törlés</button>
                    <hr>
                `;
                clientList.appendChild(div);
            });

            document.querySelectorAll('.delete-client').forEach(button => {
                button.addEventListener('click', () => deleteClient(button.dataset.id));
            });

            document.querySelectorAll('.edit-client').forEach(button => {
                button.addEventListener('click', () => fillClientForm(button.dataset.id));
            });
        });
}

function handleAddOrEditClient(e) {
    e.preventDefault();
    const name = document.getElementById('client-name').value;
    const address = document.getElementById('client-address').value;
    const tax = document.getElementById('client-tax').value;

    const method = editingClientId ? 'PUT' : 'POST';
    const url = editingClientId ? `${apiUrl}/clients/${editingClientId}` : `${apiUrl}/clients`;

    fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, address, taxNumber: tax })
    }).then(() => {
        e.target.reset();
        editingClientId = null;
        e.target.querySelector('button[type="submit"]').textContent = 'Hozzáadás';
        loadClients();
    });
}

function deleteClient(id) {
    fetch(`${apiUrl}/clients/${id}`, { method: 'DELETE' })
        .then(res => {
            if (!res.ok) return res.json().then(data => { throw new Error(data.error); });
        })
        .then(() => loadClients())
        .catch(err => alert("Nem lehet törölni a kiállítót, mert van meglévő számlája."));
}

function fillClientForm(id) {
    fetch(`${apiUrl}/clients`)
        .then(res => res.json())
        .then(clients => {
            const client = clients.find(c => c.id == id);
            if (!client) return;

            document.getElementById('client-name').value = client.name;
            document.getElementById('client-address').value = client.address;
            document.getElementById('client-tax').value = client.taxNumber;
            editingClientId = client.id;
            document.querySelector('#add-client-form button[type="submit"]').textContent = 'Kiállító mentése';
        });
}

// === Vevők ===

function loadBuyers() {
    fetch(`${apiUrl}/buyers`)
        .then(res => res.json())
        .then(buyers => {
            const buyerSelect = document.getElementById('invoice-buyer');
            const buyerList = document.getElementById('buyers-list');
            buyerSelect.innerHTML = '';
            buyerList.innerHTML = '<h3>Vevők</h3>';

            buyers.forEach(buyer => {
                const option = document.createElement('option');
                option.value = buyer.id;
                option.textContent = buyer.name;
                buyerSelect.appendChild(option);

                const div = document.createElement('div');
                div.innerHTML = `
                    <strong>${buyer.name}</strong><br>
                    ${buyer.address}<br>
                    ${buyer.taxNumber}<br>
                    <button data-id="${buyer.id}" class="edit-buyer">Módosítás</button>
                    <button data-id="${buyer.id}" class="delete-buyer">Törlés</button>
                    <hr>
                `;
                buyerList.appendChild(div);
            });

            document.querySelectorAll('.delete-buyer').forEach(button => {
                button.addEventListener('click', () => deleteBuyer(button.dataset.id));
            });

            document.querySelectorAll('.edit-buyer').forEach(button => {
                button.addEventListener('click', () => fillBuyerForm(button.dataset.id));
            });
        });
}

function handleAddOrEditBuyer(e) {
    e.preventDefault();
    const name = document.getElementById('buyer-name').value;
    const address = document.getElementById('buyer-address').value;
    const tax = document.getElementById('buyer-tax').value;

    const method = editingBuyerId ? 'PUT' : 'POST';
    const url = editingBuyerId ? `${apiUrl}/buyers/${editingBuyerId}` : `${apiUrl}/buyers`;

    fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, address, taxNumber: tax })
    }).then(() => {
        e.target.reset();
        editingBuyerId = null;
        e.target.querySelector('button[type="submit"]').textContent = 'Kiállító mentése';
        loadBuyers();
    });
}

function deleteBuyer(id) {
    fetch(`${apiUrl}/buyers/${id}`, { method: 'DELETE' })
        .then(res => {
            if (!res.ok) return res.json().then(data => { throw new Error(data.error); });
        })
        .then(() => loadBuyers())
        .catch(err => alert("Nem lehet törölni a vevőt, mert van meglévő számlája."));
}

function fillBuyerForm(id) {
    fetch(`${apiUrl}/buyers`)
        .then(res => res.json())
        .then(buyers => {
            const buyer = buyers.find(b => b.id == id);
            if (!buyer) return;

            document.getElementById('buyer-name').value = buyer.name;
            document.getElementById('buyer-address').value = buyer.address;
            document.getElementById('buyer-tax').value = buyer.taxNumber;
            editingBuyerId = buyer.id;
            document.querySelector('#add-buyer-form button[type="submit"]').textContent = 'Vevő mentése';
        });
}

// === Számlák ===

function handleAddInvoice(e) {
    e.preventDefault();

    const invoice = {
        clientId: parseInt(document.getElementById('invoice-client').value),
        buyerId: parseInt(document.getElementById('invoice-buyer').value),
        issueDate: document.getElementById('issue-date').value,
        fulfillmentDate: document.getElementById('fulfillment-date').value,
        paymentDeadline: document.getElementById('payment-deadline').value,
        totalAmount: parseFloat(document.getElementById('total-amount').value),
        vatPercent: parseInt(document.getElementById('vat-percent').value)
    };

    fetch(`${apiUrl}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice)
    })
        .then(res => {
            if (!res.ok) {
                return res.json().then(data => { throw new Error(data.error); });
            }
        })
        .then(() => {
            e.target.reset();
            loadInvoices();
        })
        .catch(err => alert(err.message));
}

function loadInvoices() {
    fetch(`${apiUrl}/invoices`)
        .then(res => res.json())
        .then(invoices => {
            const list = document.getElementById('invoice-list');
            list.innerHTML = '<h3>Számlák</h3>';

            invoices.forEach(inv => {
                const div = document.createElement('div');
                div.style.border = '1px solid #ccc';
                div.style.padding = '1em';
                div.style.marginBottom = '1em';
                div.style.backgroundColor = inv.isStorno ? '#ffe6e6' : '#f9f9f9';

                div.innerHTML = `
                    <div style="text-align:center; font-weight:bold; font-size: 1.2em;">
                        Számla #${inv.invoiceNumber} ${inv.isStorno ? '<span style="color:red;">(STORNÓZOTT)</span>' : ''}
                    </div>
                    <div style="display:flex; justify-content: space-between; margin-top: 1em;">
                        <div>
                            <strong>Kiállító:</strong><br>
                            ${inv.clientName}<br>
                            ${inv.clientAddress}<br>
                            Adószám: ${inv.clientTaxNumber}
                        </div>
                        <div style="text-align:right;">
                            <strong>Vevő:</strong><br>
                            ${inv.buyerName}<br>
                            ${inv.buyerAddress}<br>
                            Adószám: ${inv.buyerTaxNumber}
                        </div>
                    </div>
                    <div style="margin-top: 1em;">
                        <strong>Dátumok:</strong><br>
                        Kiadás: ${inv.issueDate} |
                        Teljesítés: ${inv.fulfillmentDate} |
                        Fizetési határidő: ${inv.paymentDeadline}
                    </div>

                    <div style="margin-top: 1em; font-weight: bold;">
                        Nettó: ${inv.totalAmount} Ft<br>
                        ÁFA: ${inv.vatAmount} Ft<br>
                        Bruttó: ${inv.grossAmount} Ft
                    </div>
                    ${!inv.isStorno ? `<div style="margin-top: 1em;"><button class="storno-btn" data-id="${inv.id}">Stornó</button></div>` : ''}
                `;
                list.appendChild(div);
            });

            // Eseménykezelő hozzáadása a stornó gombokhoz
            document.querySelectorAll('.storno-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    if (!confirm('Biztosan stornózni szeretnéd ezt a számlát?')) return;

                    try {
                        const response = await fetch(`${apiUrl}/invoices/storno/${id}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                        });
                        const result = await response.json();

                        if (!response.ok) throw new Error(result.error || 'Hiba történt a stornózás során');

                        alert(result.message);
                        loadInvoices();
                    } catch (error) {
                        alert('Hiba: ' + error.message);
                    }
                });
            });
        });
}


// Az aszinkron stornó funkció, ami frissíti a listát is
async function stornoInvoice(id) {
    if (!confirm('Biztosan stornózni szeretnéd ezt a számlát?')) return;

    try {
        const response = await fetch(`${apiUrl}/invoices/storno/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        const result = await response.json();

        if (!response.ok) throw new Error(result.error || 'Hiba történt a stornózás során');

        alert(result.message);
        loadInvoices();  // Frissíti a listát stornó után
    } catch (error) {
        alert('Hiba: ' + error.message);
    }
}

document.querySelectorAll('.storno-button').forEach(button => {
  button.addEventListener('click', () => {
    const invoiceId = button.dataset.invoiceId;
    stornoInvoice(invoiceId);
  });
});
