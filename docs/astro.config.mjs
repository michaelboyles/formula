// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Formula',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/michaelboyles/formula' }],
			logo: {
				src: "./src/assets/logo1.svg",
				replacesTitle: true
			},
			sidebar: [
				{
					label: 'Getting started ',
					items: [
						"getting-started/overview",
						"getting-started/installation",
					]
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
