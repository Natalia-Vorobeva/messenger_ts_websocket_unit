import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
	server: {
		proxy: {
			'/api': {
				target: 'http://a0830433.xsph.ru',
				changeOrigin: true,
				secure: false,
				rewrite: (path) => path.replace(/^\/api/, ''),
			}
		},
	},
	plugins: [react()],
	build: {
		outDir: 'dist',
		sourcemap: false,
	},
	optimizeDeps: {
		include: ['prop-types'],
	},
})