# 📦 BarcodeMailer — PWA

App per la scansione di barcode con fotocamera e invio via email.

## Requisiti

- [Node.js](https://nodejs.org) LTS (v18 o superiore)
- Google Chrome (consigliato per la fotocamera)

## Installazione e avvio

```bash
# 1. Installa le dipendenze
npm install

# 2. Avvia il server di sviluppo
npm run dev
```

Apri **http://localhost:5173** in Chrome.

> ⚠️ La fotocamera funziona solo su `localhost` o HTTPS (non su file:// o IP senza HTTPS).

## Uso

1. Crea un **nuovo blocco** (es. "Ordine Rossi")
2. Premi **Avvia scansione** → Chrome chiede il permesso fotocamera → accetta
3. Inquadra un barcode → viene aggiunto automaticamente
4. Usa **Inserimento manuale** per aggiungere codici a mano
5. Premi **Invia via email** → si apre il client email con tutti i codici

## Build per produzione (deploy)

```bash
npm run build
```

I file ottimizzati sono in `/dist`. Caricali su qualsiasi hosting statico (Netlify, Vercel, GitHub Pages).

> Per installare come app (PWA) su Android: apri in Chrome → menu ⋮ → "Aggiungi alla schermata Home"

## Struttura del progetto

```
src/
  App.tsx              # Componente principale + routing
  types.ts             # Tipi TypeScript (Block)
  useLocalStorage.ts   # Hook per la persistenza dati
  components/
    Home.tsx           # Schermata lista blocchi
    BlockDetail.tsx    # Schermata dettaglio blocco
    Scanner.tsx        # Componente fotocamera + ZXing
```

## Tecnologie

- **React 18** + **TypeScript**
- **Vite** — build tool velocissimo
- **vite-plugin-pwa** — Service Worker + manifest automatici
- **@zxing/library** — lettura barcode (EAN-13, QR, Code 128, Code 39 e altri)
- **localStorage** — persistenza dati locale, niente backend
