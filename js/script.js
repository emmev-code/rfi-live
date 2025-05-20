// VARIABILI DA MODIFICARE - VARIABLES TO MODIFY //
const jsonUrl = 'https://api.vichingo455.freeddns.org/TabelloneTreni/stazioni.json'; //JSON statico - static JSON
const ApiUri = 'PLACEHOLDER'; //JSON Dinamico - Dynamic JSON

// IMPORTANTE!! NON MODIFICARE SOTTO!! - IMPORTANT!! DO NOT MODIFY THE CODE BELOW!! //
let ultimaRichiesta = null;
let intervalloAggiornamento = null;
const delay = ms => new Promise(res => setTimeout(res, ms));
async function caricaStazioni() {
    try {
        const response = await fetch(jsonUrl);
        const stazioni = await response.json();
        const select = document.getElementById('stazione');
        select.innerHTML = '<option value="">Seleziona una stazione</option>';
        stazioni.forEach(stazione => {
            const option = document.createElement('option');
            option.value = stazione.key;
            option.textContent = stazione.text;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Errore nel caricamento delle stazioni:', error);
        document.getElementById('stazione').innerHTML = '<option>Errore nel caricamento</option>';
    }
}
async function caricaDati(event = null, richiestaManuale = false) {
    if (event) event.preventDefault();
    const placeId = document.getElementById("stazione").value;
    const arrivals = document.getElementById("tipo").value;
    const corpo = document.getElementById("corpoTabella");
    const tabella = document.getElementById("tabellaDati");
    if (!placeId) {
        if (richiestaManuale) alert("Seleziona una stazione.");
        return;
    }
    // Salva la richiesta corrente per i refresh automatici
    ultimaRichiesta = { placeId, arrivals };
    const url = `${ApiUri}/?Arrivals=${arrivals}&PlaceId=${placeId}&exclude=0,1,7,8`;
    try {
        if (richiestaManuale) {
            tabella.style.display = "table";
            corpo.innerHTML = `<tr><td colspan="5" class="loading-message">Caricamento in corso...</td></tr>`;
        }
        const response = await fetch(url);
        const data = await response.json();
        if (data.length === 0) {
            corpo.innerHTML = `<tr><td colspan="5" class="loading-message">Nessun dato disponibile.</td></tr>`;
            return;
        }
        corpo.innerHTML = data.map(row =>
            `<tr>${row.map(col => `<td>${col}</td>`).join('')}</tr>`
        ).join('');
    } catch (error) {
        console.error("Errore durante la richiesta:", error);
        if (richiestaManuale) {
            corpo.innerHTML = `<tr><td colspan="5" class="loading-message">Errore durante il caricamento dei dati. Per favore riprova.<br>PER GLI SVILUPPATORI: Controllare nella console del browser per i dettagli dell'errore.</td></tr>`;
            await delay(7000);
            tabella.style.display = "none";
        }
    }
}
function avviaAggiornamentoAutomatico() {
    if (intervalloAggiornamento) clearInterval(intervalloAggiornamento);
    intervalloAggiornamento = setInterval(() => {
        if (ultimaRichiesta) {
            caricaDati(null, false);
        }
    }, 30000); // ogni 30 secondi
}
document.getElementById("formStazione").addEventListener("submit", (e) => {
    caricaDati(e, true);
    avviaAggiornamentoAutomatico();
});
caricaStazioni();