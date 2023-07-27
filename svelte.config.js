import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
        // adapter-static is used for github pages, see https://kit.svelte.dev/docs/adapter-static.
		adapter: adapter(),
        paths: {
            base: process.env.NOVE_ENV === 'production' ? '/renpy-asset-viewer' : ''
        }
	}
};

export default config;
