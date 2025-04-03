**# Enabling HTTPS for Your Application**

First, note that if your servers are running on Render for example, https is automaticly enable.
You simply have to enable websocker secure (look at ## **3. Update WebSocket Connection**)

To enable HTTPS and ensure secure connections, follow these steps to generate an SSL certificate using `mkcert` and update your configuration files accordingly.

## **1. Generate SSL Certificates**

Use `mkcert` to create a trusted SSL certificate and key:

```sh
mkcert -install
mkcert localhost 127.0.0.1 ::1
```

This will generate the following files in your working directory:
- `localhost+2.pem` (SSL Certificate)
- `localhost+2-key.pem` (Private Key)

Move these files into the `frontend/certs/` and `backend/certs/` directory inside your project.

---

## **2. Update Your Fastify Server Configuration**

### **Frontend (frontend/src/webServ.ts)**

1. Uncomment the following imports:

```ts
import fs from "fs";
import path from "path";
```

2. Define the HTTPS options by uncommenting and modifying the following code:

```ts
const options = {
    https: {
        key: fs.readFileSync(path.join(__dirname, "../certs/localhost+2-key.pem")), //replace localhost+2-key.pem by yours
        cert: fs.readFileSync(path.join(__dirname, "../certs/localhost+2.pem")), // replace localhost+2.pem by yours
    },
};
```

3. Update the Fastify instance initialization:

```ts
const app = fastify(options); // Previously: fastify(/*options*/);
```

---

### **Backend (backend/src/server.ts)**

1. Uncomment the necessary imports:

```ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
```

2. Define the `__dirname` variable (if not already defined):

```ts
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

3. Add the HTTPS options by uncommenting the following:

```ts
const options = {
    https: {
        key: fs.readFileSync(path.join(__dirname, "../certs/localhost+2-key.pem")), //replace localhost+2-key.pem by yours
        cert: fs.readFileSync(path.join(__dirname, "../certs/localhost+2.pem")), //replace localhost+2.pem by yours
    },
};
```

4. Modify the Fastify instance initialization:

```ts
const app: FastifyInstance = fastify(options); // Previously: fastify(/*options*/);
```

---

## **3. Update WebSocket Connection**

In `frontend/src/pongDisplay.ts`, update the WebSocket connection to use **WSS** (WebSocket Secure):

```ts
const ws = new WebSocket("wss://localhost:4500/ws"); // Previously: ws://localhost:4500/ws
```

---

## **4. Restart Your Application**

After making these changes, restart your application to apply HTTPS:

```sh
docker-compose down && docker-compose up --build
```

Your application is now running securely over HTTPS! 🎉

---

### **Troubleshooting**
- If you encounter browser security warnings, make sure `mkcert` is installed and that your OS trusts its generated certificates.
- Ensure that your WebSocket (`wss://`) connection is using the correct port and matches the backend configuration.
- If the server fails to start, verify the paths to your SSL certificates.

