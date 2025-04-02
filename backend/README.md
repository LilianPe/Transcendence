# 🛠️ Transcendence Backend

Backend Node.js basé sur **Fastify** et **TypeScript**, avec **Docker** et **hot reload** via tsc -w + nodemon.

---

## 🚀 Getting Started

### 🐳 Requirements

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) (optional but recommended)

---

### 🛠️ Quick Start

#### 1. Clone the repository

    git clone <repo-url>
    cd transcendence


## 🚀 Lancer le backend

Depuis la racine du projet (transcendence) :

    make build
    make start

📍 Le backend sera disponible sur : http://localhost:5000

## 🔁 Développement avec hot reload

Le backend est automatiquement recompilé à chaque modification :

    tsc -w compile les fichiers .ts dans dist/
    nodemon relance dist/server.js à chaque changement

Tu peux coder tranquillement dans backend/src/, et les modifications seront prises en compte sans redémarrer manuellement.

## 🧠 VS Code + Dev Container

For the best experience, use VS Code with the Dev Containers extension:

## 🚀 Lancer VS Code dans le conteneur

    Modifie le .devcontainer.json a la racine
    Ouvre VS Code dans le dossier transcendence/
    Appuie sur F1 → tape :
    Dev Containers: Reopen in Container
    VS Code va build & ouvrir directement dans le conteneur backend

### ✅ Leave the Dev Container
    Click the green bottom-left corner in VS Code
    (It shows: >< Dev Container: Transcendence Frontend)

    Select: "Close Remote Connection"
    This will:
    Close the container session
    Return you to your host VS Code (outside Docker)

### Get logs

    docker compose logs -f <service>
    exemple: docker compose logs -f backend frontend <--- will display the log of back and front env.