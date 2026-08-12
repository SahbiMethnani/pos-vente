#!/bin/bash
# Script d'installation des dépendances backend

echo "🚀 Installation des dépendances POS Multi-Canaux..."

# Vérifier Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 n'est pas installé"
    exit 1
fi

echo "✅ Python3 détecté"

# Créer l'environnement virtuel
if [ ! -d "backend/venv" ]; then
    echo "📦 Création de l'environnement virtuel..."
    python3 -m venv backend/venv
fi

# Activer l'environnement virtuel
echo "🔧 Activation de l'environnement virtuel..."
source backend/venv/bin/activate

# Installer les dépendances
echo "⬇️  Installation des dépendances Python..."
pip install --upgrade pip
pip install -r backend/requirements.txt

echo ""
echo "✅ Installation backend terminée!"
echo ""
echo "📝 Prochaines étapes:"
echo "1. Configurer la base de données dans backend/.env"
echo "2. Lancer le serveur:"
echo "   source backend/venv/bin/activate"
echo "   cd backend"
echo "   uvicorn app.main:app --reload"
echo ""
echo "3. Installer les dépendances frontend:"
echo "   cd frontend"
echo "   npm install"
echo "   npm run dev"
echo ""
echo "4. Accéder à:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
