# Template Studio

Catalogo dei template frontend e applicazione Coterie.

```text
Templates/
├── index.html       # catalogo e preview
├── componenti.html  # libreria dei componenti
├── componenti.css
├── styles.css
├── script.js
├── template1/       # progetto originale della collezione, invariato
└── coterie/         # app Next.js Coterie
```

## Avvio locale

Avvia l'app Coterie sulla porta 3001:

```bash
cd coterie
pnpm install
pnpm dev -p 3001
```

In un secondo terminale, dalla cartella `Templates`, avvia il catalogo:

```bash
python3 -m http.server 3000
```

Apri [http://localhost:3000](http://localhost:3000) e usa la preview Coterie.
