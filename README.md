# 🛒 POS Plateforme Multi-Canaux

Application COMPLÈTE de gestion commerciale + E-commerce + Réseaux Sociaux développée avec **FastAPI** (backend) et **React + Vite** (frontend).

## ✨ Module Principaux

### 1. **Système POS Classique**
- ✅ Gestion Caisse en temps réel
- ✅ Gestion Produits & Catégories
- ✅ Gestion Stock & Mouvements
- ✅ Gestion Clients & Fournisseurs
- ✅ Historique Ventes & Rapports

### 2. **📱 Gestion Réseaux Sociaux** (NOUVEAU)
- Publier sur: **Website + Facebook + Instagram + TikTok**
- Programmer les publications
- Suivre les engagements (likes, commentaires, partages)
- Interface unique pour tous les réseaux

### 3. **🛍️ Site E-commerce Public** (NOUVEAU)
- Vitrine produits avec images
- Panier intelligent
- Commandes en ligne
- Suivi de commandes
- Multiples méthodes de paiement

---

## 📁 Structure du projet

```
pos-project/
├── backend/                  # API FastAPI
│   ├── app/
│   │   ├── main.py           # Point d'entrée FastAPI
│   │   ├── core/
│   │   │   ├── config.py     # Configuration (env vars)
│   │   │   ├── database.py   # SQLAlchemy engine + session
│   │   │   └── security.py   # JWT + hash + middleware
│   │   ├── models/
│   │   │   └── models.py     # Modèles SQLAlchemy + Post, ClientOrder (NOUVEAU)
│   │   ├── schemas/
│   │   │   └── schemas.py    # Schémas Pydantic + PostCreate, ClientOrderCreate (NOUVEAU)
│   │   ├── crud/
│   │   │   └── crud.py       # Opérations CRUD + posts/orders functions (NOUVEAU)
│   │   └── api/routes/
│   │       ├── auth.py       # Auth + Users
│   │       ├── products.py   # Produits + Catégories
│   │       ├── routes.py     # Clients, Fournisseurs, Stock, Ventes, Settings, Dashboard
│   │       └── social_and_orders.py  # NOUVEAU - Posts + Orders + Social API
│   ├── requirements.txt       # + requests, pillow, aiofiles
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/                 # App React + Vite
│   ├── src/
│   │   ├── main.jsx          # Entry point
│   │   ├── App.jsx           # Router + Store Provider + routes sociales
│   │   ├── index.css         # Tailwind + composants CSS
│   │   ├── store/
│   │   │   └── store.js      # Redux (auth + panier)
│   │   ├── services/
│   │   │   └── api.js        # Axios avec intercepteurs JWT
│   │   ├── components/
│   │   │   └── layout/
│   │   │       └── Layout.jsx  # Sidebar + navigation + Réseaux Sociaux
│   │   └── pages/
│   │       ├── LoginPage.jsx
│   │       ├── DashboardPage.jsx
│   │       ├── CaissePage.jsx           # Module caisse
│   │       ├── ProduitsPage.jsx
│   │       ├── SocialMediaPage.jsx      # NOUVEAU - Gestion publications
│   │       ├── WebsitePage.jsx          # NOUVEAU - Site e-commerce public
│   │       ├── OtherPages.jsx           # Catégories, Stock, Clients, Fournisseurs
│   │       └── SalesAndMore.jsx         # Ventes, Rapports, Paramètres
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── nginx.conf
│
├── FEATURES.md              # NOUVEAU - Documentation détaillée des fonctionnalités
├── .env.example             # NOUVEAU - Variables d'environnement
├── docker-compose.yml
└── README.md
```

---

## 🚀 Lancement rapide (développement local)

### Prérequis

- Python 3.12+
- Node.js 18+
- (Optionnel) PostgreSQL ou Docker

### 1. Backend

```bash
cd backend

# Créer l'environnement virtuel avec Python 3.12+
python3 -m venv venv
source venv/bin/activate       # Linux/Mac
# ou : venv\Scripts\activate   # Windows

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env si nécessaire (par défaut SQLite)

# Lancer le serveur
uvicorn app.main:app --reload --port 8000

> Si Python 3.12 n'est pas installé localement, utilisez le conteneur Docker du backend tel que défini dans `backend/Dockerfile`.
```

✅ API disponible sur : http://localhost:8000  
✅ Documentation Swagger : http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

✅ Frontend disponible sur : http://localhost:5173

---

## 🐳 Lancement avec Docker (production)

```bash
# À la racine du projet
docker-compose up --build
```

| Service   | URL                        |
|-----------|----------------------------|
| Frontend  | http://localhost:5173       |
| Backend   | http://localhost:8000       |
| API Docs  | http://localhost:8000/docs  |

---

## ☁️ Déploiement Render + Netlify

### Backend & base de données sur Render
- Sur Render, crée un service `Web Service` pour le backend.
- Choisis `Docker` si tu veux utiliser `backend/Dockerfile`, sinon `Python` avec la commande :
  - Build command: `pip install -r requirements.txt`
  - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Ajoute une base `PostgreSQL` sur Render.
- Défini la variable d’environnement `DATABASE_URL` sur l’URL fournie par Render.
- Défini aussi `SECRET_KEY`, `ALGORITHM=HS256`, `ACCESS_TOKEN_EXPIRE_MINUTES=480`.
- Pour autoriser le front, ajoute `BACKEND_ALLOWED_ORIGINS=https://<ton-site>.netlify.app` ou `*`.

### Frontend sur Netlify
- Sur Netlify, crée un site à partir du dossier `frontend`.
- Build command : `npm install && npm run build`
- Publish directory : `dist`
- Ajoute la variable d’environnement `VITE_API_URL=https://<ton-backend>.onrender.com`
- Le projet contient `frontend/netlify.toml` pour la configuration SPA.

---

## 🔑 Compte par défaut

| Champ       | Valeur    |
|-------------|-----------|
| Utilisateur | `admin`   |
| Mot de passe| `admin123`|
| Rôle        | Admin     |

> ⚠️ Changer le mot de passe et la `SECRET_KEY` en production !

---

## 📦 Modules disponibles

| Module          | Description                              |
|-----------------|------------------------------------------|
| 🔐 Auth          | Connexion JWT, rôles (admin/caissier/gestionnaire) |
| 📊 Dashboard     | Statistiques temps réel, graphiques CA   |
| 🛒 Caisse        | Module POS complet avec panier           |
| 📦 Produits      | CRUD produits, codes-barres, TVA         |
| 🏷️ Catégories    | Gestion des catégories de produits       |
| 📉 Stock         | Entrées/sorties, historique, alertes     |
| 👤 Clients       | Base clients, historique achats          |
| 🚚 Fournisseurs  | Gestion fournisseurs                     |
| 🧾 Ventes        | Historique, détail ticket, annulation    |
| 📈 Rapports      | CA journalier/mensuel, top produits      |
| ⚙️ Paramètres    | Config boutique, devise, TVA, ticket     |

---

## 🌍 Configuration Tunisie

- Devise par défaut : **TND (DT)**
- TVA par défaut : **19%**
- Format date : français (`fr-FR`)

Pour modifier, aller dans **Paramètres** depuis l'interface.

---

## 🔌 API Endpoints principaux

```
POST   /api/auth/login              → Connexion
GET    /api/auth/me                 → Profil actuel

GET    /api/products                → Liste produits
POST   /api/products                → Créer produit
PUT    /api/products/{id}           → Modifier produit

GET    /api/categories              → Liste catégories
POST   /api/categories              → Créer catégorie

POST   /api/sales                   → Créer une vente
GET    /api/sales                   → Historique ventes
POST   /api/sales/{id}/cancel       → Annuler une vente

POST   /api/stocks/in               → Entrée de stock
POST   /api/stocks/out              → Sortie de stock
GET    /api/stocks/movements        → Historique mouvements

GET    /api/dashboard/stats         → Statistiques dashboard

GET    /api/settings                → Lire les paramètres
PUT    /api/settings                → Modifier les paramètres
```

Documentation complète : http://localhost:8000/docs

---

## 🛠️ Stack technique

**Backend**
- FastAPI + Uvicorn
- SQLAlchemy (ORM)
- Pydantic v2 (validation)
- JWT (python-jose + passlib)
- SQLite (dev) / PostgreSQL (prod)

**Frontend**
- React 18 + Vite
- Redux Toolkit (state management)
- React Router v6
- Axios (HTTP)
- Tailwind CSS (styles)
- Recharts (graphiques)
- React Hot Toast (notifications)
- Lucide React (icônes)

**Infra**
- Docker + Docker Compose
- Nginx (reverse proxy + SPA)
- PostgreSQL (production)

---

## 📝 Notes développeur

- Le backend utilise SQLite par défaut (fichier `pos.db` local) → pas besoin de PostgreSQL pour démarrer
- Le compte admin est créé automatiquement au premier démarrage
- Les paramètres par défaut (TND, 19% TVA) sont initialisés automatiquement
- Toutes les routes API sont protégées par JWT sauf `/api/auth/login`
- Le proxy Vite redirige `/api/*` → `http://localhost:8000/api/*` en dev
