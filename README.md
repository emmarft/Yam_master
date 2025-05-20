# 🎲 YAM – Jeu de Dés Multijoueur

Un jeu de Yam jouable en multijoueur ou contre un bot, développé avec **React Native** et **Socket.IO**.

---

## 📦 Stack Technique

### 🖥️ Frontend
- React Native (via Expo)
- Socket.IO Client
- React Navigation
- Styled Components

### 🖧 Backend
- Node.js
- Express
- Socket.IO
- Architecture événementielle

---

## 🧭 Architecture Globale

L'application suit une architecture **client-serveur** basée sur **WebSocket** via **Socket.IO** :

- Le client se connecte au serveur pour créer ou rejoindre une partie.
- Les échanges en temps réel permettent un gameplay fluide et synchrone.
- Le serveur gère toute la logique métier du jeu (déroulement, scores, règles).

---

## 🚀 Comment lancer le projet

### ✅ Prérequis
- Node.js (version ≥ 14)
- npm ou yarn
- Expo CLI :  
  ```bash
  npm install -g expo-cli
  ```

### 📡 Lancer le Backend
Ouvre un terminal :
```bash
cd Yam_master\backend
npm install
npm run start
```
Le serveur démarre sur `localhost:3000`

### 📱 Lancer le Frontend
Ouvre un autre terminal :
```bash
cd Yam_master
npm install
npx expo start
```

L'interface Expo démarre et affiche un QR code. Tu peux alors :
- Scanner le QR code avec l'app Expo Go sur ton téléphone (iOS/Android)
- Appuyer sur 'w' pour ouvrir dans le navigateur web
- Appuyer sur 'a' pour ouvrir dans un émulateur Android
- Appuyer sur 'i' pour ouvrir dans un simulateur iOS

## 🧩 Fonctionnalités du Jeu

- 🎮 Mode multijoueur en ligne
- 🤖 Mode solo contre un bot
- 🎲 Lancer, relancer et verrouiller les dés
- 📊 Calcul automatique du score
- 🔁 Gestion des tours
- 🥇 Classement des joueurs à la fin
- 🔌 Synchronisation en temps réel avec Socket.IO
