import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    test: {
        include: [
            'src/**/*.test.ts',
            'src/**/*.test.tsx',
        ],
        watch: false,
        environment: "jsdom",
    },
})
