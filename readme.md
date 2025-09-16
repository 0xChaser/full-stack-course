# MyContacts - Application Full-Stack de Gestion de Contacts

Une application web complète de gestion de contacts développée avec React.js, Node.js, Express.js et MongoDB. Cette application permet aux utilisateurs de s'inscrire, se connecter et gérer leurs contacts personnels de manière sécurisée.

## 🚀 Fonctionnalités

- **Authentification sécurisée** : Inscription et connexion avec JWT
- **Gestion des contacts** : Création, lecture, modification et suppression (CRUD)
- **Interface moderne** : Interface utilisateur responsive avec Tailwind CSS
- **API REST** : API complète avec documentation Swagger
- **Containerisation Docker** : Déploiement facile avec Docker et Docker Compose
- **Tests complets** : Suite de tests unitaires et d'intégration
- **Sécurité** : Hachage des mots de passe, protection des routes

## 📁 Structure du Projet

```
full-stack-course/
├── client/                 # Application React (Frontend)
├── server/                 # API Node.js/Express (Backend)
├── docker-compose.yaml     # Configuration Docker Compose
└── README.md              # Ce fichier
```

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **JWT** - Authentification par tokens
- **bcrypt** - Hachage des mots de passe
- **Jest** - Framework de tests
- **Swagger** - Documentation API

### Frontend
- **React.js** - Librairie UI
- **React Router** - Navigation
- **Axios** - Client HTTP
- **Tailwind CSS** - Framework CSS
- **React Testing Library** - Tests frontend

### DevOps
- **Docker** - Containerisation
- **Docker Compose** - Orchestration multi-conteneurs
- **Traefik** - Reverse proxy (production)

## 🐳 Configuration Docker

### Profils Docker Compose

Le projet utilise Docker Compose avec deux profils :

#### Profil Développement (`dev`)
```bash
# Démarrer MongoDB en mode développement
docker-compose --profile dev up -d
```

**Services inclus :**
- `mongo` : Base de données MongoDB sur le port 27017
- Volume persistant pour les données

#### Profil Production (`prod`)
```bash
# Démarrer en mode production
docker-compose --profile prod up -d
```

**Services inclus :**
- `mongo_prod` : MongoDB avec réseau Traefik
- `server_prod` : API Node.js avec reverse proxy
- `client_prod` : Application React buildée
- Configuration SSL automatique avec Let's Encrypt

### Dockerfiles

#### Backend (`server/Dockerfile`)
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
```

#### Frontend (`client/Dockerfile`)
```dockerfile
FROM node:23-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
```

## 🔧 Installation et Démarrage

### Prérequis
- Node.js (v18+)
- npm ou yarn
- Docker et Docker Compose (optionnel)
- MongoDB (si pas d'utilisation de Docker)

### Installation Locale

1. **Cloner le repository**
```bash
git clone <repository-url>
cd full-stack-course
```

2. **Backend**
```bash
cd server
npm install
# Créer un fichier .env avec JWT_SECRET
echo "JWT_SECRET=your-secret-key" > .env
npm start  # Port 8080
```

3. **Frontend**
```bash
cd client
npm install
npm start  # Port 3000
```

### Installation avec Docker

1. **Mode développement**
```bash
# Démarrer MongoDB
docker-compose --profile dev up -d

# Backend (terminal 1)
cd server
npm install
npm start

# Frontend (terminal 2)  
cd client
npm install
npm start
```

2. **Mode production**
```bash
# Créer le fichier .env avec les variables nécessaires
echo "MONGO_URI=mongodb://mongo_prod:27017/mycontacts" > .env
echo "JWT_SECRET=your-production-secret" >> .env

# Démarrer tous les services
docker-compose --profile prod up -d
```

## 🔙 Backend - API Node.js/Express

### Architecture

```
server/
├── controllers/           # Logique métier
│   ├── authController.js     # Authentification
│   └── contactController.js  # Gestion contacts
├── middleware/
│   └── auth.js              # Middleware JWT
├── models/               # Modèles Mongoose
│   ├── user.js             # Modèle utilisateur
│   └── contact.js          # Modèle contact
├── routes/               # Routes Express
│   ├── auth.js             # Routes auth
│   └── contact.js          # Routes contacts
├── tests/                # Tests
├── swagger.json          # Documentation API
└── index.js             # Point d'entrée
```

### API Endpoints

#### Authentification
- `POST /auth/register` - Inscription utilisateur
- `POST /auth/login` - Connexion utilisateur

#### Contacts (protégés par JWT)
- `GET /contact/` - Récupérer tous les contacts
- `POST /contact/` - Créer un contact
- `GET /contact/:id` - Récupérer un contact
- `PATCH /contact/:id` - Modifier un contact
- `DELETE /contact/:id` - Supprimer un contact

### Modèles de Données

#### Utilisateur
```javascript
{
  email: String (unique, requis),
  password: String (requis, haché),
  timestamps: true
}
```

#### Contact
```javascript
{
  email: String (requis),
  firstName: String (requis),
  lastName: String (requis, unique par utilisateur),
  phone: Number (requis),
  user_id: String (requis),
  timestamps: true
}
```

### Documentation API

L'API est documentée avec Swagger et accessible à :
- **Développement** : http://localhost:8080/api-docs
- **Production** : https://full-js-api.flo-isk.fr/api-docs

### Sécurité

- **Hachage des mots de passe** avec bcrypt (salt rounds: 10)
- **Authentification JWT** avec expiration 24h
- **Protection des routes** avec middleware d'authentification
- **Validation des données** avec Mongoose
- **CORS** configuré pour le frontend

## 🎨 Frontend - Application React

### Architecture

```
client/src/
├── components/
│   ├── auth/                # Authentification
│   │   ├── Login.jsx           # Page de connexion
│   │   ├── Register.jsx        # Page d'inscription
│   │   └── ProtectedRoute.jsx  # Route protégée
│   ├── tables/
│   │   └── ContactTable.jsx    # Table des contacts
│   ├── modals/
│   │   ├── Modal.jsx           # Composant modal générique
│   │   └── ContactFormModal.jsx # Formulaire contact
│   └── HomePage.jsx         # Page d'accueil
├── services/
│   ├── AuthService.jsx      # Service d'authentification
│   └── ContactService.jsx   # Service de contacts
├── axios.js                # Configuration Axios
└── App.js                 # Composant principal
```

### Pages et Fonctionnalités

#### 1. Page de Connexion (`/login`)
- Formulaire de connexion (email/mot de passe)
- Validation côté client
- Redirection automatique si déjà connecté
- Messages d'erreur et de succès
- Lien vers l'inscription

#### 2. Page d'Inscription (`/register`)
- Formulaire d'inscription avec confirmation mot de passe
- Validation (email valide, mot de passe min 6 caractères)
- Connexion automatique après inscription
- Messages d'erreur en temps réel

#### 3. Page d'Accueil (`/homepage`)
- **Protection** : Accessible uniquement aux utilisateurs connectés
- **Header** : Affichage email utilisateur + bouton déconnexion
- **Table des contacts** : Affichage de tous les contacts utilisateur
- **Actions** : Ajouter, modifier, supprimer contacts
- **Modal** : Formulaire d'ajout/modification de contact

### Services

#### AuthService
- `login(email, password)` - Connexion
- `register(email, password)` - Inscription
- `logout()` - Déconnexion
- `isAuthenticated()` - Vérification authentification
- `getCurrentUser()` - Récupération utilisateur courant
- `getToken()` - Récupération token JWT

#### ContactService
- `getAllContacts()` - Récupération contacts
- `addContact(data)` - Ajout contact
- `updateContact(id, data)` - Modification contact
- `deleteContact(id)` - Suppression contact
- `getContactById(id)` - Récupération contact par ID

### Styling

- **Tailwind CSS** pour le styling moderne
- **Design responsive** pour mobile et desktop
- **Composants réutilisables** avec classes utilitaires
- **Interface intuitive** avec feedback visuel

### Gestion d'État

- **localStorage** pour la persistance du token JWT et des données utilisateur
- **React hooks** (useState, useEffect) pour l'état local
- **React Router** pour la navigation et protection des routes

## 🧪 Tests

Le projet inclut une suite de tests complète pour le backend.

### Structure des Tests

```
server/tests/
├── controllers/          # Tests des contrôleurs
├── middleware/          # Tests des middleware
├── models/             # Tests des modèles
├── routes/            # Tests d'intégration des routes
├── utils/            # Utilitaires de test
└── setup.js         # Configuration globale
```

### Types de Tests

1. **Tests unitaires** : Contrôleurs, middleware, modèles
2. **Tests d'intégration** : Routes API complètes
3. **Tests de validation** : Schémas Mongoose
4. **Tests d'authentification** : JWT, bcrypt

### Commandes de Test

```bash
cd server

# Tous les tests
npm test

# Tests avec coverage
npm run test:coverage

# Tests en mode watch
npm run test:watch

# Tests verbose
npm run test:verbose
```

### Configuration des Tests

- **Jest** comme framework de test
- **Supertest** pour les tests d'API HTTP
- **MongoDB Memory Server** pour base de données de test
- **Mocking** des dépendances externes
- **Coverage** avec rapports HTML

### Métriques de Test

Les tests couvrent :
- Controllers (authController, contactController)
- Middleware (authentification JWT)
- Models (User, Contact)
- Routes (auth, contact)

## 🚀 Déploiement

### Environnement de Production

L'application est configurée pour un déploiement avec :

- **Traefik** comme reverse proxy
- **SSL automatique** avec Let's Encrypt
- **Domaines configurés** :
  - Frontend : `full-js.flo-isk.fr`
  - API : `full-js-api.flo-isk.fr`

### Variables d'Environnement

Créer un fichier `.env` à la racine :

```env
# Base de données
MONGO_URI=mongodb://mongo_prod:27017/mycontacts

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Environnement
NODE_ENV=production
```

### Commandes de Déploiement

```bash
# Build et démarrage production
docker-compose --profile prod up -d --build

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose --profile prod down
```

## 🛡️ Sécurité

### Mesures Implémentées

1. **Authentification JWT** avec expiration
2. **Hachage des mots de passe** avec bcrypt
3. **Protection des routes** côté API et frontend
4. **Validation des données** entrantes
5. **CORS** configuré correctement
6. **Isolation des utilisateurs** (chaque utilisateur ne voit que ses contacts)

### Recommandations

- Utiliser des secrets JWT forts en production
- Configurer HTTPS en production
- Implémenter un rate limiting
- Ajouter une validation plus stricte des données
- Mettre en place des logs de sécurité

## 🐛 Résolution de Problèmes

### Problèmes Courants

1. **Erreur de connexion MongoDB**
   ```bash
   # Vérifier que MongoDB est démarré
   docker-compose --profile dev ps
   ```

2. **Erreur CORS**
   - Vérifier la configuration CORS dans `server/index.js`
   - S'assurer que le frontend utilise la bonne URL API

3. **Token JWT invalide**
   - Vérifier la variable d'environnement `JWT_SECRET`
   - Effacer le localStorage du navigateur

4. **Tests qui échouent**
   ```bash
   # Nettoyer et réinstaller les dépendances
   rm -rf node_modules package-lock.json
   npm install
   ```

### Logs et Debug

```bash
# Logs Docker
docker-compose logs -f [service_name]

# Logs backend
cd server && npm start

# Tests avec debug
cd server && npm run test:verbose

# Tests avec coverage
cd server && npm run test:coverage
```


## 👤 Auteur

**0xChaser** - Développeur Full-Stack

---

*Développé en utilisant React, Node.js et MongoDB*
