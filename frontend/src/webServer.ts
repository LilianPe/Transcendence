import fastifyStatic from "@fastify/static";
import fastifyView from "@fastify/view";
import path from "path";
import { fileURLToPath } from "url"; // Pour remplacer __dirname
// @ts-ignore
import ejs from "ejs";
import fastify from "fastify";
// import fs from "fs";
// Partie serveur

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// certificat ssl

// const options = {
//     https: {
//         key: fs.readFileSync(path.join(__dirname, "../certs/localhost+2-key.pem")),
//         cert: fs.readFileSync(path.join(__dirname, "../certs/localhost+2.pem")),
//     },
// };

const app = fastify(/*options*/);

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
        console.log(" HTTP Web server running on http://localhost:3000");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();
