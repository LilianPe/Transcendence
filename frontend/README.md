# Transcendence Frontend

A clean development environment using **Vite**, **TypeScript**, **Tailwind CSS**, fully containerized with **Docker** and **Docker Compose**, and compatible with **VS Code Dev Containers**.

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

#### 2. Launch the app

docker compose up --build
Open your browser: http://localhost:3000

Edit any file in frontend/src/ or frontend/index.html — Vite will reload instantly.


## 📦 Build for production

docker compose exec frontend npm run build
Output is generated in frontend/dist/.


## 🧠 VS Code + Dev Container

For the best experience, use VS Code with the Dev Containers extension:

### ▶️ Run inside container (recommended)

    Open the project in VS Code
    Press F1 → Dev Containers: Reopen in Container
    Wait for the container to build and launch

You'll now have:
    Autocompletion for Tailwind classes
    IntelliSense for TypeScript
    Access to node_modules inside container

### ✅ Leave the Dev Container
    Click the green bottom-left corner in VS Code
    (It shows: >< Dev Container: Transcendence Frontend)

    Select: "Close Remote Connection"
    This will:
    Close the container session
    Return you to your host VS Code (outside Docker)

## 📂 Project Structure

transcendence/
├── .devcontainer/         # VS Code container config
├── docker-compose.yml     # Dev environment
└── frontend/              # Frontend app
    ├── Dockerfile
    ├── index.html
    ├── package.json
    ├── postcss.config.mjs
    ├── tailwind.config.js
    ├── tsconfig.json
    └── src/
        ├── main.ts
        └── style.css