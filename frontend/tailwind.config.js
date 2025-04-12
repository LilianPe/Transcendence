/** @type {import('tailwindcss').Config} */
module.exports = {
	mode: 'jit',
	content: [
	  "./src/TS/**/*.ts",   // Ciblage de tous les fichiers TypeScript dans le dossier srcs/TS
	  "./src/templates/**/*.ejs",   // Ciblage de tous les fichiers ejs dans le dossier srcs/templates
	  "./dist/**/*.js",       // Ciblage des fichiers JS dans le dossier dist
	],
	theme: {
	  extend: {},
	},
	plugins: [],
  }
  