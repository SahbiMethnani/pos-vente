# 🔗 Guide d'Intégration des APIs Sociales

Ce guide vous montre comment connecter votre POS à Facebook, Instagram et TikTok.

---

## 📌 Architecture

```
Admin Panel (POS)
    ↓
API Backend (/api/posts, /api/settings/social)
    ↓
Social Media APIs (Facebook Graph, Instagram Graph, TikTok)
    ↓
Publication simultanée sur tous les réseaux
```

---

## 1️⃣ Configuration Facebook

### Étape 1 : Créer une Application Facebook

1. Aller sur [Facebook Developers](https://developers.facebook.com/)
2. Cliquer sur **My Apps** → **Create App**
3. Sélectionner **Business** type
4. Remplir les informations:
   - App Name: `MonPOS`
   - App Purpose: `Business`
5. Cliquer **Create App**

### Étape 2 : Configurer Facebook Login

1. Dans le dashboard app, ajouter **Facebook Login** produit
2. Configurer **Settings** → **Basic**
3. Récupérer:
   - **App ID**
   - **App Secret**

### Étape 3 : Obtenir les Credentials

1. Aller à **Tools** → **Graph API Explorer**
2. Dans le token dropdown, sélectionner votre app
3. Exécuter cette requête:
```graphql
me?fields=accounts
```

4. Cela retournera vos pages Facebook avec leurs IDs
5. Récupérer:
   - **Page ID** (ex: `123456789`)
   - **Access Token** (long token)

### Étape 4 : Ajouter dans POS

1. Aller à **Paramètres** → **Réseaux Sociaux**
2. Remplir:
   - **Facebook Page ID**: `123456789`
   - **Facebook Access Token**: Votre token long
3. Cliquer **Sauvegarder**

---

## 2️⃣ Configuration Instagram

### Étape 1 : Pré-requis

- Avoir un compte Instagram professionnel
- Être administrateur d'une page Facebook
- Lier ce compte Instagram à votre page Facebook

### Étape 2 : Lier Instagram à Facebook

1. Aller à [Instagram Business](https://business.instagram.com/)
2. Cliquer **Settings** → **Linked Accounts**
3. Cliquer **Link to Page**
4. Sélectionner votre page Facebook

### Étape 3 : Obtenir les Credentials

1. Utiliser le même **Access Token** que Facebook (il fonctionne pour Instagram aussi)
2. Récupérer votre **Business Account ID**:
   - Dans Graph API Explorer, exécuter:
```graphql
{
  me {
    instagram_business_account {
      id
      name
      username
    }
  }
}
```

3. Récupérer:
   - **Instagram Business ID** (ex: `987654321`)
   - **Access Token** (même que Facebook)

### Étape 4 : Ajouter dans POS

1. Aller à **Paramètres** → **Réseaux Sociaux**
2. Remplir:
   - **Instagram Business ID**: `987654321`
   - **Instagram Access Token**: Votre token
3. Cliquer **Sauvegarder**

---

## 3️⃣ Configuration TikTok

### Étape 1 : Créer une Application TikTok

1. Aller sur [TikTok Developer](https://developer.tiktok.com/)
2. Cliquer **Create Application**
3. Sélectionner:
   - **Platform**: Web
   - **App Category**: Business Tool
   - **Use Case**: Content Management

### Étape 2 : Configurer OAuth

1. Dans **App Info**, ajouter:
   - **Redirect URLs**: `http://localhost:8000/callback`
   - **Valid domains**: `localhost:8000`

2. Récupérer:
   - **Client Key** (App ID)
   - **Client Secret**

### Étape 3 : Obtenir Access Token

Via OAuth flow ou CLI:

```bash
# Option 1 : OAuth Flow (recommandé)
# Rediriger l'utilisateur à:
https://www.tiktok.com/v1/oauth/authorize?client_key=YOUR_CLIENT_KEY&redirect_uri=http://localhost:8000/callback&response_type=code&scope=video.create,video.query,user.info.basic

# L'utilisateur autorise
# TikTok redirige avec un code
# Échanger le code pour un access_token

# Option 2 : TikTok CLI (test)
tiktok-cli --auth --client-key YOUR_KEY --client-secret YOUR_SECRET
```

### Étape 4 : Ajouter dans POS

1. Aller à **Paramètres** → **Réseaux Sociaux**
2. Remplir:
   - **TikTok Access Token**: Votre access token
   - **TikTok Video ID**: (optionnel, pour les vidéos pinned)
3. Cliquer **Sauvegarder**

---

## 🚀 Publier une Publication

### Via Admin Panel

1. Aller à **Réseaux Sociaux**
2. Cliquer **Nouvelle Publication**
3. Remplir:
   - **Titre**: `Nouvelle collection d'été 2026`
   - **Contenu**: `Découvrez nos nouveaux produits...`
   - **Image/Vidéo**: URL ou upload
   - **Réseaux**: Cocher Web, Facebook, Instagram, TikTok
4. Cliquer **Publier**

### Via API

```bash
curl -X POST http://localhost:8000/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Nouvelle Collection",
    "content": "Découvrez nos produits...",
    "image_url": "https://...",
    "platforms": ["website", "facebook", "instagram", "tiktok"]
  }'
```

---

## 📊 Suivi des Engagements

Les statistiques sont mises à jour automatiquement:
- ❤️ **Likes**: Nombre total de réactions
- 💬 **Commentaires**: Nombre de commentaires
- 🔄 **Partages**: Nombre de fois partagé

Visible dans la liste des publications.

---

## 🔒 Sécurité des Tokens

### Bonnes Pratiques

✅ **À FAIRE:**
- Stocker les tokens dans `backend/.env`
- Utiliser des tokens `long-lived`
- Renouveler les tokens tous les 60 jours
- Utiliser HTTPS en production
- Activer l'authentification 2FA sur les comptes

❌ **À NE PAS FAIRE:**
- Partager les tokens publiquement
- Utiliser des credentials en dur dans le code
- Stocker les tokens dans le localStorage
- Committer les tokens dans git

### Rotation des Tokens

```bash
# Tous les 60 jours, regénérer les tokens dans:
# Paramètres → Réseaux Sociaux
# Récupérer nouveaux tokens depuis les plateformes
# Les ajouter dans le POS
```

---

## 🐛 Dépannage

### Publication échoue

**Problème:** `401 Unauthorized`
**Solution:** Vérifier que les tokens sont valides et pas expiré

**Problème:** `400 Bad Request`
**Solution:** Vérifier que l'image URL est accessible

### Tokens expirés

**Problème:** Publier retourne `Invalid Token`
**Solution:** 
1. Aller à l'interface admin que vous avez utilisée
2. Regénérer un nouveau token
3. Mettre à jour dans Paramètres → Réseaux Sociaux
4. Réessayer la publication

### Page/Compte non reconnu

**Problème:** `Page not found`
**Solution:** Vérifier que le Page ID ou Account ID est correct dans Paramètres

---

## 📱 Webhooks (Avancé)

Pour recevoir les mises à jour en temps réel:

```bash
# Facebook Webhooks
POST https://graph.facebook.com/v18.0/{page_id}/subscribed_apps
  ?access_token=YOUR_TOKEN

# Instagram Webhooks  
POST https://graph.instagram.com/v18.0/{business_account_id}/subscriptions
  ?access_token=YOUR_TOKEN

# TikTok Webhooks
POST https://open.tiktokapis.com/v1/webhooks
  -H "Authorization: Bearer YOUR_TOKEN"
```

Pour chaque, configurer votre URL callback:
```
https://votre-domain.com/api/webhooks/social
```

---

## 🎯 Cas d'Usage

### Cas 1: Promotion de Produit
```
1. Admin crée une publication avec photo du produit
2. Contenu: "Nouveau produit en stock!"
3. Sélectionne Facebook + Instagram + Website
4. Clique Publier
5. Publication visible sur tous les canaux en même temps
6. Clients voient la même promotion partout
```

### Cas 2: Campagne Saisonnière
```
1. Admin planifie une campagne pour juillet
2. Crée 5 publications programmées
3. Sélectionne date/heure de publication
4. Le système publie automatiquement à l'heure prévue
5. Même contenu étendu à tous les réseaux
```

### Cas 3: Engagement Social
```
1. Admin publie promotion
2. Clients commentent et likent sur Facebook/Instagram
3. Admin voit les métriques en temps réel
4. Ajuste la stratégie selon l'engagement
5. Les meilleurs contenus restent en ligne plus longtemps
```

---

## 📚 Ressources

- [Facebook Graph API Docs](https://developers.facebook.com/docs/graph-api)
- [Instagram Graph API Docs](https://developers.instagram.com/docs)
- [TikTok API Docs](https://developers.tiktok.com/doc)
- [OAuth 2.0 Standards](https://oauth.net/2/)

---

**Version:** 1.0  
**Dernière mise à jour:** Juillet 2026  
**Support:** Via l'interface Admin POS
