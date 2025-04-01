import fastifyStatic from "@fastify/static";
import fastifyView from "@fastify/view";
import path from "path";
import { fileURLToPath } from "url"; // Pour remplacer __dirname
// @ts-ignore
import ejs from "ejs";
import fastify from "fastify";

// Remplace __dirname avec une version compatible ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = fastify();

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
  res.view("src/templates/index.ejs");
});

const start = async () => {
  try {
    await app.listen({ port: 3000 });
    console.log("Server running on http://localhost:3000");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();