FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN cp ./src/ressources ./dist/ressources
RUN npm run tsc
EXPOSE 3000
CMD ["node", "dist/webServer.js"]