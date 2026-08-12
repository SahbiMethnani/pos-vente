# ⚡ QuickStart - Démarre en 5 minutes

## 🎯 Avant de Commencer

✅ Assurez-vous d'avoir:
- Python 3.12+ installé
- Node.js 18+ installé
- PostgreSQL (optionnel, SQLite activé par défaut)

## 🚀 Démarrage Rapide

### 1. Backend (FastAPI)

```bash
# Naviguer au dossier backend
cd backend

# Créer l'environnement virtuel
python3 -m venv venv

# Activer l'environnement virtuel
source venv/bin/activate          # Linux/Mac
# ou: venv\Scripts\activate       # Windows

# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur
uvicorn app.main:app --reload --port 8000
```

✅ Backend prêt sur: **http://localhost:8000**  
📚 Docs API: **http://localhost:8000/docs**

### 2. Frontend (React)

```bash
# Naviguer au dossier frontend
cd frontend

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

✅ Frontend prêt sur: **http://localhost:5173**

---

## 👤 Identifiants de Connexion

**Par défaut (créé automatiquement):**
- **User:** `admin`
- **Password:** `admin123`

> ⚠️ Changez ce mot de passe en production!

---

## 📱 Pages Disponibles

### Admin Panel (après login)

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/` | Vue d'ensemble KPIs |
| Caisse | `/caisse` | Encaissement temps réel |
| Produits | `/produits` | Gestion catalogue |
| Stock | `/stock` | Mouvements stock |
| Clients | `/clients` | Base clients |
| Fournisseurs | `/fournisseurs` | Gestion fournisseurs |
| **Réseaux Sociaux** | **/reseaux-sociaux** | 🆕 Publier Facebook/Instagram/TikTok |
| Ventes | `/ventes` | Historique ventes |
| Rapports | `/rapports` | Analytics |
| Paramètres | `/parametres` | Config générale + réseaux sociaux |

### Site Public E-commerce

URL: **http://localhost:5173/website**

- ✅ Vitrine produits
- ✅ Panier
- ✅ Commande en ligne
- ✅ Suivi commande

---

## 🔧 Configuration Réseaux Sociaux

### Étape 1: Créer Applications

1. [Facebook Developers](https://developers.facebook.com/) → Créer app
2. [TikTok Developers](https://developer.tiktok.com/) → Créer app
3. [Instagram Business](https://business.instagram.com/) → Lier à Facebook

### Étape 2: Récupérer Tokens

- **Facebook Page ID** et **Access Token**
- **Instagram Business ID** et **Access Token**
- **TikTok Access Token**

### Étape 3: Configurer dans POS

1. Admin Panel → **Paramètres**
2. Onglet **Réseaux Sociaux**
3. Remplir les fields
4. Cliquer **Sauvegarder**

### Étape 4: Publier

1. Admin Panel → **Réseaux Sociaux**
2. Cliquer **Nouvelle Publication**
3. Remplir contenu
4. Sélectionner plateformes
5. Cliquer **Publier**

✅ Publication en live sur tous les réseaux!

---

## 📊 API Endpoints Principaux

### Authentification
```
POST   /api/auth/login              # Login
GET    /api/auth/me                 # Profil actuel
```

### 📱 Réseaux Sociaux (NOUVEAU)
```
GET    /api/posts                   # Lister publications
POST   /api/posts                   # Créer publication
POST   /api/posts/{id}/publish      # Publier
GET    /api/public/posts            # Posts website
```

### 🛍️ E-commerce (NOUVEAU)
```
POST   /api/orders                  # Créer commande (public)
GET    /api/orders                  # Lister commandes (admin)
GET    /api/orders/number/{num}     # Suivi commande
```

### Produits
```
GET    /api/products                # Lister produits
POST   /api/products                # Créer produit
GET    /api/categories              # Catégories
```

**Docs complètes:** http://localhost:8000/docs

---

## 🗂️ Structure Fichiers Importants

```
pos-project/
├── backend/
│   ├── app/
│   │   ├── models/models.py        # + Post, ClientOrder
│   │   ├── crud/crud.py            # + post/order functions
│   │   ├── schemas/schemas.py      # + PostCreate, ClientOrderCreate
│   │   └── api/routes/
│   │       └── social_and_orders.py  # NOUVEAU
│   └── requirements.txt            # Include: requests, pillow
│
├── frontend/
│   └── src/pages/
│       ├── SocialMediaPage.jsx      # NOUVEAU
│       └── WebsitePage.jsx          # NOUVEAU
│
├── FEATURES.md                    # Documentation complète
├── API_INTEGRATION.md             # Guide intégration sociales
└── README.md                      # Mise à jour avec v2.0
```

---

## 🐛 Dépannage Rapide

### Port déjà utilisé
```bash
# Changer le port
uvicorn app.main:app --reload --port 8001
```

### Module not found
```bash
# Réinstaller dépendances
pip install -r requirements.txt --force-reinstall
```

### Database error
```bash
# Réinitialiser la base (attention: données perdues)
rm backend/app.db  # Si SQLite
# Backend recréera les tables au démarrage
```

### CORS error
Vérifié dans `backend/app/main.py`:
```python
allow_origins=["http://localhost:5173", "http://localhost:3000"]
```

---

## 📈 Prochaines Étapes

1. ✅ Configurer réseaux sociaux (voir [API_INTEGRATION.md](API_INTEGRATION.md))
2. ⬜ Tester la publication multi-réseaux
3. ⬜ Tester le site e-commerce public
4. ⬜ Configurer le paiement en ligne (Stripe, PayPal)
5. ⬜ Déployer en production

---

## 🌍 Déploiement

### Avec Docker
```bash
docker-compose up --build
```

### Render + Netlify
Voir README.md pour les instructions détaillées.

---

## 📞 Support

- 📖 Docs: `http://localhost:8000/docs`
- 🆘 Issues: Consultez les fichiers `.md` du projet
- 🔧 Configuration: Paramètres → Admin Panel

---

**Vous êtes prêt! 🎉**

Accédez maintenant à: **http://localhost:5173**

Identifiants: `admin` / `admin123`
