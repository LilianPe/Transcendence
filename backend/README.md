# 🛠️ Transcendence Backend

Backend Node.js basé sur **Fastify** et **TypeScript**, avec **Docker** et **hot reload** via tsc -w + nodemon.

---

## 🚀 Lancer le backend

Depuis la racine du projet (transcendence) :

docker compose up --build

📍 Le backend sera disponible sur : http://localhost:5000
🔁 Développement avec hot reload

Le backend est automatiquement recompilé à chaque modification :
    tsc -w compile les fichiers .ts dans dist/
    nodemon relance dist/server.js à chaque changement

Tu peux coder tranquillement dans backend/src/, et les modifications seront prises en compte sans redémarrer manuellement.
📂 Structure

backend/
├── src/
│   └── server.ts         # Point d'entrée Fastify
├── dist/                 # Fichiers compilés automatiquement
├── package.json          # Dépendances + scripts
├── tsconfig.json         # Config TypeScript
├── Dockerfile            # Image Docker

🐳 Dockerfile

L’image installe les dépendances, compile le TypeScript et lance :

npm run watch & npm run dev

🚀 Lancer VS Code dans le conteneur
    Modifie le .devcontainer.json a la racine
    Ouvre VS Code dans le dossier transcendence/
    Appuie sur F1 → tape :
    Dev Containers: Reopen in Container
    VS Code va build & ouvrir directement dans le conteneur backend

✅ Scripts disponibles
Script	Description
npm run build	Compile le TypeScript dans dist/
npm run watch	Watcher tsc -w pour auto-rebuild
npm run dev	Démarre dist/server.js avec Nodemon
