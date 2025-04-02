import fastifyStatic from "@fastify/static";
import fastifyView from "@fastify/view";
import path from "path";
import { fileURLToPath } from "url"; // Pour remplacer __dirname
// @ts-ignore
import ejs from "ejs";
import fastify from "fastify";
// Partie serveur
const app = fastify();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
        console.log("Web server running on http://localhost:3000");
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
};
start();
