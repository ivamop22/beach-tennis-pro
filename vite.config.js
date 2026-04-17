import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    base: '/beach-tennis-pro/',
    server: {
        port: 3050,
    }
});
