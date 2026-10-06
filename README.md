# Template Studio

Questa cartella contiene il catalogo dei template e il progetto Fernly.

```text
Template/
├── index.html       # landing/catalogo
├── styles.css
├── script.js
└── template1/       # app Next.js Fernly
```

## Avvio locale

In un terminale avvia il template:

```bash
cd /home/eliana/Scrivania/Template/template1
pnpm install
pnpm dev
```

Poi, in un secondo terminale, avvia la landing:

```bash
cd /home/eliana/Scrivania/Template
python3 -m http.server 3000
```

Apri [http://localhost:3000](http://localhost:3000). Cliccando la card Fernly si apre una preview live dell’app in `template1`.
