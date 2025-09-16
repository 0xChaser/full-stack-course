# Tests Backend

Ce dossier contient tous les tests pour l'API backend du projet.

## Structure des Tests

```
tests/
├── setup.js                    # Configuration globale des tests
├── utils/
│   └── testHelpers.js          # Utilitaires et helpers pour les tests
├── models/
│   ├── user.test.js           # Tests du modèle User
│   └── contact.test.js        # Tests du modèle Contact
├── controllers/
│   ├── authController.test.js # Tests du contrôleur d'authentification
│   └── contactController.test.js # Tests du contrôleur de contacts
├── middleware/
│   └── auth.test.js           # Tests du middleware d'authentification
├── routes/
│   ├── auth.test.js           # Tests des routes d'authentification
│   └── contact.test.js        # Tests des routes de contacts
└── README.md                  # Ce fichier
```

## Technologies Utilisées

- **Jest** : Framework de test JavaScript
- **Supertest** : Librairie pour tester les API HTTP
- **MongoDB Memory Server** : Base de données MongoDB en mémoire pour les tests
- **bcrypt** : Pour le hachage des mots de passe (mocké dans les tests)
- **jsonwebtoken** : Pour la génération de tokens JWT (mocké dans les tests)

## Types de Tests

### Tests de Modèles (`models/`)
- Validation des schémas Mongoose
- Tests de création, validation et contraintes
- Tests des timestamps automatiques
- Tests des méthodes du modèle

### Tests de Contrôleurs (`controllers/`)
- Tests des fonctions de contrôleur isolées
- Mock des dépendances (base de données, bcrypt, JWT)
- Tests des cas de succès et d'erreur
- Validation des réponses HTTP

### Tests de Middleware (`middleware/`)
- Tests du middleware d'authentification
- Validation des tokens JWT
- Tests des cas d'erreur d'authentification
- Mock des dépendances

### Tests de Routes (`routes/`)
- Tests d'intégration des endpoints
- Tests avec vraie base de données (en mémoire)
- Tests des codes de statut HTTP
- Tests de l'authentification end-to-end

## Comment Exécuter les Tests

### Prérequis
```bash
# Installer les dépendances
npm install
```

### Commandes de Test

```bash
# Exécuter tous les tests
npm test

# Exécuter les tests avec coverage
npm test -- --coverage

# Exécuter les tests en mode watch
npm test -- --watch

# Exécuter un fichier de test spécifique
npm test -- tests/models/user.test.js

# Exécuter les tests d'un dossier spécifique
npm test -- tests/controllers/

# Exécuter les tests avec plus de détails
npm test -- --verbose
```

### Options Jest Configurées

- **testEnvironment**: `node` - Environnement Node.js pour les tests
- **setupFilesAfterEnv**: Configuration globale avant chaque test
- **testTimeout**: 30 secondes de timeout pour les tests asynchrones
- **collectCoverageFrom**: Collecte de coverage pour les fichiers source
- **coverageDirectory**: Dossier de sortie pour les rapports de coverage

## Helpers de Test

Le fichier `utils/testHelpers.js` contient des utilitaires pour :

- **createTestUser()** : Créer un utilisateur de test
- **createTestContact()** : Créer un contact de test
- **generateTestToken()** : Générer un token JWT de test
- **createAuthHeaders()** : Créer des headers d'authentification
- **validUserData** : Données utilisateur valides
- **validContactData** : Données contact valides
- **invalidUserData** : Données utilisateur invalides pour les tests d'erreur
- **invalidContactData** : Données contact invalides pour les tests d'erreur

## Configuration des Tests

### Base de Données
- Utilise MongoDB Memory Server pour une base de données en mémoire
- Chaque test démarre avec une base de données propre
- Nettoyage automatique après chaque test

### Variables d'Environnement
- `JWT_SECRET` : Clé secrète pour les tests JWT
- `NODE_ENV` : Défini sur 'test'

### Mocking
- Les modules externes comme `bcrypt` et `jsonwebtoken` sont mockés dans les tests de contrôleurs
- Les middleware sont mockés dans les tests de routes pour l'isolation

## Bonnes Pratiques

1. **Isolation** : Chaque test est indépendant et ne dépend pas des autres
2. **Nettoyage** : La base de données est nettoyée après chaque test
3. **Mocking** : Les dépendances externes sont mockées quand approprié
4. **Couverture** : Viser une couverture de code élevée
5. **Lisibilité** : Tests descriptifs avec des noms explicites
6. **Performance** : Utilisation de base de données en mémoire pour la rapidité

## Résolution de Problèmes

### Erreurs Communes

1. **Tests qui traînent** : Vérifier que toutes les connexions sont fermées
2. **Erreurs de timeout** : Augmenter le timeout si nécessaire
3. **Erreurs de mock** : S'assurer que les mocks sont correctement configurés
4. **Erreurs de base de données** : Vérifier que MongoDB Memory Server fonctionne

### Debug

```bash
# Exécuter avec plus de logs
npm test -- --verbose --no-coverage

# Exécuter un seul test pour debug
npm test -- --testNamePattern="should create user"
```

## Coverage

Le rapport de coverage est généré dans le dossier `coverage/` et inclut :
- Couverture des lignes
- Couverture des branches
- Couverture des fonctions
- Rapport HTML navigable
