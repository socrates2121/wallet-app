# Wallet App · Σέριφος

Personal finance tracker για bartender σεζόν.

---

## Deploy σε Vercel — Βήμα-βήμα

### Βήμα 1 — GitHub

1. Πήγαινε στο [github.com](https://github.com) και κάνε Sign up (δωρεάν)
2. Πάτα **New repository**
3. Όνομα: `wallet-app` → **Create repository**
4. Κατέβασε το [GitHub Desktop](https://desktop.github.com/) αν δεν έχεις git
5. Ανέβασε όλα τα αρχεία του φακέλου στο repository

### Βήμα 2 — Vercel

1. Πήγαινε στο [vercel.com](https://vercel.com) → Sign up with GitHub
2. Πάτα **Add New Project**
3. Επίλεξε το `wallet-app` repository → **Import**
4. Framework: **Next.js** (αυτόματα)
5. Πάτα **Environment Variables** και πρόσθεσε:
   - Key: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...` (το κλειδί σου)
6. Πάτα **Deploy**

Σε 2 λεπτά έχεις link π.χ. `wallet-app.vercel.app` 🎉

---

### Βήμα 3 — Εγκατάσταση στο κινητό (σαν app)

**iPhone:**
1. Άνοιξε το link στο Safari
2. Πάτα το κουμπί Share (το τετράγωνο με το βέλος)
3. **Add to Home Screen**

**Android:**
1. Άνοιξε το link στο Chrome
2. Πάτα τις 3 τελείες πάνω δεξιά
3. **Add to Home Screen**

---

## Τοπική εκτέλεση (για development)

```bash
npm install
cp .env.local.example .env.local
# Βάλε το API key σου στο .env.local
npm run dev
```

Άνοιξε [http://localhost:3000](http://localhost:3000)

---

## Δομή project

```
wallet-app/
├── app/
│   ├── layout.jsx          # Fonts + metadata
│   ├── page.jsx            # Root page
│   ├── globals.css         # Global styles
│   └── api/
│       └── insights/
│           └── route.js    # Claude API (κρατάει το key κρυφό)
├── components/
│   └── FinanceApp.jsx      # Η εφαρμογή
├── public/
│   └── manifest.json       # PWA config
├── .env.local.example      # Template για το API key
└── package.json
```
