import { defineConfig } from 'tsdown'
import Vue from 'unplugin-vue/rolldown'
export default defineConfig([
    {
        entry: ['./src/plugin/index.ts'],
        target: 'node20',
        platform: 'neutral',
        plugins: [Vue({ isProduction: true })],
        dts: true,

    },
])