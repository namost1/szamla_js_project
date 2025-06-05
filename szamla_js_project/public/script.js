async function loadClients() {
    const res = await fetch('/api/clients');
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
        deleteBtn.addEventListener('click', async () => {
            if (confirm(`Biztos törlöd a kiállítót: ${client.name}?`)) {
                await deleteClient(client.id);
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
    const res = await fetch('/api/buyers');
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
        deleteBtn.addEventListener('click', async () => {
            if (confirm(`Biztos törlöd a vevőt: ${buyer.name}?`)) {
                await deleteBuyer(buyer.id);
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
    try {
        const response = await fetch("/api/invoices");
        if (!response.ok) throw new Error("Nem sikerült betölteni a számlákat.");

        const invoices = await response.json();

        const invoiceList = document.getElementById("invoice-list");
        invoiceList.innerHTML = "<h3>Számlák</h3>";

        invoices.forEach(invoice => {
            const invoiceDiv = document.createElement("div");
            invoiceDiv.className = "invoice-item";
            if (invoice.isStorno === 1 || invoice.isStorno === true) {
                invoiceDiv.classList.add("storno");
            }

            // Számlaszám felül
            const invoiceNumber = document.createElement("h2");
            invoiceNumber.textContent = `Számla: ${invoice.invoiceNumber}`;
            invoiceNumber.style.textAlign = "center";
            invoiceDiv.appendChild(invoiceNumber);

            // Köztes konténer a két oldalnak (eladó és vevő)
            const partiesContainer = document.createElement("div");
            partiesContainer.style.display = "flex";
            partiesContainer.style.justifyContent = "space-between";
            partiesContainer.style.marginBottom = "10px";

            // Eladó adatai (bal oldalt)
            const sellerDiv = document.createElement("div");
            sellerDiv.style.flex = "1";
            sellerDiv.innerHTML = `<strong>Eladó:</strong><br>
                ${invoice.clientName}<br>
                ${invoice.clientAddress || ""}<br>
                ${invoice.clientTaxNumber || ""}`;
            partiesContainer.appendChild(sellerDiv);

            // Vevő adatai (jobb oldalt)
            const buyerDiv = document.createElement("div");
            buyerDiv.style.flex = "1";
            buyerDiv.style.textAlign = "right";
            buyerDiv.innerHTML = `<strong>Vevő:</strong><br>
                ${invoice.buyerName}<br>
                ${invoice.buyerAddress || ""}<br>
                ${invoice.buyerTaxNumber || ""}`;
            partiesContainer.appendChild(buyerDiv);

            invoiceDiv.appendChild(partiesContainer);

            // Dátumok alatta (kiállítás, teljesítés, fizetési határidő)
            const datesDiv = document.createElement("div");
            datesDiv.style.marginBottom = "10px";
            datesDiv.innerHTML = `
                Kiadás dátuma: ${invoice.issueDate || '-'}<br>
                Teljesítés dátuma: ${invoice.fulfillmentDate || '-'}<br>
                Fizetési határidő: ${invoice.paymentDeadline || '-'}<hr>
            `;
            invoiceDiv.appendChild(datesDiv);

            // Összesítések alul: nettó, ÁFA, bruttó
            const totalsDiv = document.createElement("div");
            totalsDiv.style.textAlign = "left";
            totalsDiv.innerHTML = `
                Nettó összeg: <strong>${invoice.totalAmount} Ft</strong><br>
                ÁFA: <strong>${invoice.vatAmount} Ft</strong><br>
                Bruttó összeg: <strong>${invoice.grossAmount} Ft</strong>
            `;
            invoiceDiv.appendChild(totalsDiv);

            // Storno gomb vagy státusz
            if (!invoice.isStorno || invoice.isStorno === 0) {
                const stornoBtn = document.createElement("button");
                stornoBtn.textContent = "Storno";
                stornoBtn.className = "storno-btn";
                stornoBtn.style.marginTop = "10px";
                stornoBtn.addEventListener("click", async () => {
                    if (confirm(`Biztosan stornózni szeretnéd a ${invoice.invoiceNumber} számú számlát?`)) {
                        try {
                            const res = await fetch(`/api/invoices/${invoice.id}/storno`, { method: "POST" });
                            if (!res.ok) throw new Error("Nem sikerült stornózni a számlát.");
                            alert("A számla sikeresen stornózva.");
                            await loadInvoices();
                        } catch (error) {
                            alert(error.message);
                        }
                    }
                });
                invoiceDiv.appendChild(stornoBtn);
            } else {
                const stornoLabel = document.createElement("span");
                stornoLabel.textContent = " (Stornózott)";
                stornoLabel.style.color = "red";
                stornoLabel.style.display = "block";
                stornoLabel.style.marginTop = "10px";
                invoiceDiv.appendChild(stornoLabel);
            }

            invoiceList.appendChild(invoiceDiv);
        });

    } catch (error) {
        alert("Hiba történt a számlák betöltésekor: " + error.message);
    }
}



async function deleteClient(id) {
    try {
        const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Nem sikerült törölni a kiállítót.');
        await loadClients();
        await loadInvoices();
    } catch (error) {
        alert(error.message);
    }
}

async function deleteBuyer(id) {
    try {
        const res = await fetch(`/api/buyers/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Nem sikerült törölni a vevőt.');
        await loadBuyers();
        await loadInvoices();
    } catch (error) {
        alert(error.message);
    }
}

// ... ide jöhetnek még az addClient, addBuyer, addInvoice és form kezelés függvényei

// Kezdeti betöltés
window.onload = async () => {
    await loadClients();
    await loadBuyers();
    await loadInvoices();
};
