// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Formula',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/michaelboyles/formula' }],
			sidebar: [
				{
					label: 'Getting started ',
					autogenerate: { directory: 'getting-started' },
				},
				{
					label: "Hooks",
					autogenerate: { directory: 'hooks' },
				},
				{
					label: 'Components',
					autogenerate: { directory: 'components' },
				},
			],
		}),
	],
});
