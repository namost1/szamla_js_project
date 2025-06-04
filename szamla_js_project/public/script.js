async function loadClients() {
    const res = await fetch('/clients');
    const clients = await res.json();

    const list = document.getElementById('clients-list');
    const select = document.getElementById('invoice-client');
    list.innerHTML = '<h3>Kiállítók</h3>';
    select.innerHTML = '';

    clients.forEach(client => {
        const div = document.createElement('div');
        div.className = 'entity-item';

        const span = document.createElement('span');
        span.textContent = `${client.name} (${client.taxNumber})`;
        span.dataset.id = client.id;
        span.style.cursor = 'pointer';
        span.addEventListener('click', () => {
            fillClientForm(client);
        });

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Módosítás';
        editBtn.className = 'modify-btn';
        editBtn.addEventListener('click', () => {
            fillClientForm(client);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Törlés';
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', () => {
            if (confirm(`Biztos törlöd a kiállítót: ${client.name}?`)) {
                deleteClient(client.id);
            }
        });

        div.appendChild(span);
        div.appendChild(editBtn);
        div.appendChild(deleteBtn);
        list.appendChild(div);

        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = client.name;
        select.appendChild(option);
    });
}

async function loadBuyers() {
    const res = await fetch('/buyers');
    const buyers = await res.json();

    const list = document.getElementById('buyers-list');
    const select = document.getElementById('invoice-buyer');
    list.innerHTML = '<h3>Vevők</h3>';
    select.innerHTML = '';

    buyers.forEach(buyer => {
        const div = document.createElement('div');
        div.className = 'entity-item';

        const span = document.createElement('span');
        span.textContent = `${buyer.name} (${buyer.taxNumber})`;
        span.dataset.id = buyer.id;
        span.style.cursor = 'pointer';
        span.addEventListener('click', () => {
            fillBuyerForm(buyer);
        });

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Módosítás';
        editBtn.className = 'modify-btn';
        editBtn.addEventListener('click', () => {
            fillBuyerForm(buyer);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Törlés';
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', () => {
            if (confirm(`Biztos törlöd a vevőt: ${buyer.name}?`)) {
                deleteBuyer(buyer.id);
            }
        });

        div.appendChild(span);
        div.appendChild(editBtn);
        div.appendChild(deleteBtn);
        list.appendChild(div);

        const option = document.createElement('option');
        option.value = buyer.id;
        option.textContent = buyer.name;
        select.appendChild(option);
    });
}

async function loadInvoices() {
    const res = await fetch('/invoices');
    const invoices = await res.json();

    const container = document.getElementById('invoice-list');
    container.innerHTML = '<h3>Számlák</h3>';

    invoices.forEach(inv => {
        const div = document.createElement('div');
        div.className = 'invoice-item';
        if (inv.status === 'storno') {
            div.classList.add('storno');
        }

        const header = document.createElement('div');
        header.className = 'invoice-header';
        header.textContent = `Számla #${inv.invoiceNumber}`;

        const parties = document.createElement('div');
        parties.className = 'invoice-parties';

        const clientDiv = document.createElement('div');
        clientDiv.className = 'party';
        clientDiv.innerHTML = `<strong>Kiállító:</strong> ${inv.clientName} <br> ${inv.clientAddress} <br> Adószám: ${inv.clientTaxNumber}`;

        const buyerDiv = document.createElement('div');
        buyerDiv.className = 'party';
        buyerDiv.innerHTML = `<strong>Vevő:</strong> ${inv.buyerName} <br> ${inv.buyerAddress} <br> Adószám: ${inv.buyerTaxNumber}`;

        parties.appendChild(clientDiv);
        parties.appendChild(buyerDiv);

        const dates = document.createElement('div');
        dates.className = 'invoice-dates';
        dates.textContent = `Kiadás: ${inv.issueDate} | Teljesítés: ${inv.fulfillmentDate} | Fizetési határidő: ${inv.paymentDeadline}`;

        const amounts = document.createElement('div');
        amounts.className = 'invoice-amounts';
        const vatAmount = inv.totalAmount * (inv.vatPercent / 100);
        const gross = inv.totalAmount + vatAmount;
        amounts.textContent = `Nettó: ${inv.totalAmount.toFixed(2)} Ft | ÁFA: ${vatAmount.toFixed(2)} Ft | Bruttó: ${gross.toFixed(2)} Ft`;

        div.appendChild(header);
        div.appendChild(parties);
        div.appendChild(dates);
        div.appendChild(amounts);

        container.appendChild(div);
    });
}

function fillClientForm(client) {
    document.getElementById('client-name').value = client.name;
    document.getElementById('client-address').value = client.address || '';
    document.getElementById('client-tax').value = client.taxNumber;
    editingClientId = client.id;
}

function fillBuyerForm(buyer) {
    document.getElementById('buyer-name').value = buyer.name;
    document.getElementById('buyer-address').value = buyer.address || '';
    document.getElementById('buyer-tax').value = buyer.taxNumber;
    editingBuyerId = buyer.id;
}

let editingClientId = null;
let editingBuyerId = null;

document.getElementById('add-client-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('client-name').value.trim();
    const address = document.getElementById('client-address').value.trim();
    const taxNumber = document.getElementById('client-tax').value.trim();

    if (!name || !taxNumber) {
        alert('A név és az adószám megadása kötelező!');
        return;
    }

    if (editingClientId) {
        await fetch(`/clients/${editingClientId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name, address, taxNumber})
        });
        editingClientId = null;
    } else {
        await fetch('/clients', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name, address, taxNumber})
        });
    }

    e.target.reset();
    await loadClients();
});

document.getElementById('add-buyer-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('buyer-name').value.trim();
    const address = document.getElementById('buyer-address').value.trim();
    const taxNumber = document.getElementById('buyer-tax').value.trim();

    if (!name || !taxNumber) {
        alert('A név és az adószám megadása kötelező!');
        return;
    }

    if (editingBuyerId) {
        await fetch(`/buyers/${editingBuyerId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name, address, taxNumber})
        });
        editingBuyerId = null;
    } else {
        await fetch('/buyers', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name, address, taxNumber})
        });
    }

    e.target.reset();
    await loadBuyers();
});

document.getElementById('add-invoice-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const clientId = document.getElementById('invoice-client').value;
    const buyerId = document.getElementById('invoice-buyer').value;
    const issueDate = document.getElementById('issue-date').value;
    const fulfillmentDate = document.getElementById('fulfillment-date').value;
    const paymentDeadline = document.getElementById('payment-deadline').value;
    const totalAmount = parseFloat(document.getElementById('total-amount').value);
    const vatPercent = parseFloat(document.getElementById('vat-percent').value);

    if (!clientId || !buyerId || !issueDate || !fulfillmentDate || !paymentDeadline) {
        alert('Minden dátumot és kiállítót, vevőt ki kell választani!');
        return;
    }

    const issue = new Date(issueDate);
    const maxDeadline = new Date(issue);
    maxDeadline.setDate(maxDeadline.getDate() + 30);
    if (new Date(paymentDeadline) > maxDeadline) {
        alert('A fizetési határidő nem lehet több, mint a kiállítás dátuma + 30 nap.');
        return;
    }

    await fetch('/invoices', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            clientId,
            buyerId,
            issueDate,
            fulfillmentDate,
            paymentDeadline,
            totalAmount,
            vatPercent
        })
    });

    e.target.reset();
    await loadInvoices();
});

async function deleteClient(id) {
    await fetch(`/clients/${id}`, { method: 'DELETE' });
    await loadClients();
}

async function deleteBuyer(id) {
    await fetch(`/buyers/${id}`, { method: 'DELETE' });
    await loadBuyers();
}

window.addEventListener('load', async () => {
    await loadClients();
    await loadBuyers();
    await loadInvoices();
});
