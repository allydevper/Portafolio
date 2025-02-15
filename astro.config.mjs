// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
	server: {
		host: '0.0.0.0'
	},
	output: "server",
	adapter: node({
		mode: "standalone"
	}),
	integrations: [react()],
    vite: {
        plugins: [tailwindcss()],
    },
});
