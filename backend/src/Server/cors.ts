import { app } from "./../server.js"
import cors from "@fastify/cors";

export function allowCors(server: string, methods: Array<string>, headers:Array<string>) {
	app.register(cors, {
		origin: server,
		methods: methods,
		allowedHeaders: headers,
	});
}