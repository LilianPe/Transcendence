import fastifyStatic from "@fastify/static";
import fastifyView from "@fastify/view";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url"; // Pour remplacer __dirname
// @ts-ignore
import ejs from "ejs";
import fastify from "fastify";
// Partie serveur

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// console.log(path.join(__dirname, "../certs/fullchain.pem"));
// console.log(path.join(__dirname, "../certs/privkey.pem"));

// https
const options = {
    https: {
        cert: fs.readFileSync(path.join(__dirname, "../certs/fullchain.pem")),
        key: fs.readFileSync(path.join(__dirname, "../certs/privkey.pem")),
    },
};

const app = fastify(options);

// Pour certif ssl
// app.register(fastifyStatic, {
//     root: path.join(__dirname, "../.well-known"), // Servir les fichiers sous .well-known/acme-challenge/
//     prefix: "/.well-known/", // Préfixe pour accéder aux fichiers
// });

app.register(fastifyStatic, {
    root: path.join(__dirname, "../dist"), // Chemin vers le dossier dist
    prefix: "/dist/", // Préfixe pour accéder aux fichiers
});

app.register(fastifyView, {
    engine: {
        ejs,
    },
});

app.get("/", (req, res) => {
    console.log("Serving index.ejs");
    res.view("src/templates/index.ejs");
});

const start = async () => {
    try {
        await app.listen({ port: 3000, host: "0.0.0.0" });
        console.log("Web server running on https://localhost:3000");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();
