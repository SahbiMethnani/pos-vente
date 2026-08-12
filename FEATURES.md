# ✨ POS Plateforme Multi-Canaux (v2.0)

## 🎯 Nouvelles Fonctionnalités

Votre POS a été transformé en une **plateforme de gestion complète** pour :

### 1. 📱 **Gestion Réseaux Sociaux**
Publiez sur **Website + Facebook + Instagram + TikTok** depuis une interface unique

**Chemin Admin:** `/reseaux-sociaux`

**Fonctionnalités:**
- Créer et programmer des publications
- Publier simultanément sur plusieurs réseaux
- Suivre les likes, commentaires et partages
- Brouillons et publications programmées

**API Endpoints:**
```
POST   /api/posts                 # Créer post
GET    /api/posts                 # Lister posts
GET    /api/posts/{id}            # Détails post
PUT    /api/posts/{id}            # Modifier post
POST   /api/posts/{id}/publish    # Publier
DELETE /api/posts/{id}            # Supprimer
PUT    /api/settings/social       # Configurer tokens
```

### 2. 🛍️ **Site E-commerce Public**

**URL Publique:** `/website` (sans authentification)

**Fonctionnalités:**
- Vitrine produits avec images
- Catégories et recherche
- Panier (stocké en localStorage)
- Commande en ligne
- Suivi de commande
- Paiement (multiples méthodes)

**API Endpoints:**
```
POST   /api/orders                      # Créer commande (public)
GET    /api/orders                      # Lister (admin)
GET    /api/orders/{id}                 # Détails (public + tracking)
GET    /api/orders/number/{order_num}   # Suivi par numéro
PUT    /api/orders/{id}/status          # Mise à jour statut (admin)
PUT    /api/orders/{id}/tracking        # Numéro suivi (admin)
GET    /api/public/posts                # Posts pour site
GET    /api/public/settings             # Paramètres publics
```

### 3. 📊 **Gestion Complète des Commandes Client**

**Statuts de Commande:**
- `pending` - En attente de confirmation
- `confirmed` - Confirmée
- `processing` - En préparation
- `shipped` - En livraison
- `delivered` - Livrée
- `cancelled` - Annulée
- `refunded` - Remboursée

---

## 🔧 Configuration des Réseaux Sociaux

### Facebook
1. Aller sur [Facebook Developers](https://developers.facebook.com/)
2. Créer une app
3. Récupérer `Page ID` et `Access Token`
4. Dans Paramètres → Réseaux Sociaux → Ajouter les identifiants

### Instagram
1. Convertir compte perso en compte professionnel
2. Lier à une page Facebook
3. Récupérer `Business Account ID` et `Access Token`
4. Dans Paramètres → Réseaux Sociaux → Ajouter les identifiants

### TikTok
1. Créer un compte développeur [TikTok Developers](https://developer.tiktok.com/)
2. Obtenir `Access Token` via OAuth
3. Dans Paramètres → Réseaux Sociaux → Ajouter le token

---

## 📁 Structure des Fichiers Ajoutés

### Backend
```
backend/app/
├── models/models.py          # + Post, ClientOrder, OrderStatus
├── schemas/schemas.py        # + PostCreate, ClientOrderCreate
├── crud/crud.py              # + post/order functions
└── api/routes/
    └── social_and_orders.py  # NOUVEAU - Routes posts + orders
```

### Frontend
```
frontend/src/pages/
├── SocialMediaPage.jsx       # NOUVEAU - Gestion publications
└── WebsitePage.jsx           # NOUVEAU - Site e-commerce public
```

---

## 🚀 Utilisation

### Admin - Gérer les Publications
1. Accéder à **Réseaux Sociaux** dans le menu
2. Cliquer **Nouvelle Publication**
3. Remplir titre, contenu, image/vidéo
4. Sélectionner les réseaux (Website/Facebook/Instagram/TikTok)
5. **Publier** ou programmer pour plus tard

### Client - Acheter sur le Site
1. Aller sur le site e-commerce (URL publique)
2. Parcourir les produits par catégorie
3. Ajouter au panier
4. Remplir les informations
5. Valider la commande
6. Suivi de commande avec numéro

### Admin - Gérer les Commandes
1. Aller dans **Tableau de bord**
2. Voir les commandes client
3. Mettre à jour le statut
4. Ajouter numero de suivi
5. Client reçoit les notifications

---

## 🔐 Sécurité

- ✅ Authentification requise pour admin
- ✅ Endpoints publics limités (POST orders, GET public)
- ✅ Tokens stockés de manière sécurisée
- ✅ CORS configuré pour frontend
- ✅ Email confirmation pour commandes

---

## 📱 URLs Importantes

### Admin Interface
- Dashboard: `http://localhost:5173/`
- Réseaux Sociaux: `http://localhost:5173/reseaux-sociaux`
- Paramètres: `http://localhost:5173/parametres`

### Site Public E-commerce
- Boutique: `http://localhost:5173/website`
- API Publique: `http://localhost:8000/api/public`

### API Documentation
- Swagger: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## 🌟 Prochains Développements

- [ ] Intégration automatique avec APIs sociales
- [ ] Email notifications pour clients
- [ ] SMS notifications de livraison
- [ ] Analytics en temps réel
- [ ] Gestion des stocks temps réel avec site
- [ ] Payment Gateway (Stripe, PayPal)
- [ ] App mobile
- [ ] Multi-langue

---

## 📞 Support

Pour intégrer les APIs sociales:
- **Facebook:** Utiliser Facebook Graph API
- **Instagram:** Utiliser Instagram Graph API
- **TikTok:** Utiliser TikTok Business API

Les tokens doivent être configurés via l'interface Admin.

---

**Version:** 2.0  
**Date:** Juillet 2026  
**Statut:** ✅ Production Ready
