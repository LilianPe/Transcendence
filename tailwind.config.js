/** @type {import('tailwindcss').Config} */
module.exports = {
	mode: 'jit',
	content: [
	  "./public/**/*.html", // Ciblage de tous les fichiers HTML dans le dossier public
	  "./srcs/TS/**/*.ts",   // Ciblage de tous les fichiers TypeScript dans le dossier srcs/TS
	  "./dist/**/*.js"       // Ciblage des fichiers JS dans le dossier dist
	],
	theme: {
	  extend: {},
	},
	plugins: [],
  }
  