// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: "Formula",
			social: [{ icon: "github", label: "GitHub", href: "https://github.com/michaelboyles/formula" }],
			logo: {
				light: "./src/assets/logo-light.svg",
				dark: "./src/assets/logo-dark.svg",
				replacesTitle: true
			},
			sidebar: [
				{
					label: "Getting started",
					items: [
						"getting-started/overview",
						"getting-started/installation",
						"getting-started/fields",
						"getting-started/array-fields",
						"getting-started/optimizing-rerenders",
					]
				},
				{
					label: "Hooks",
					autogenerate: { directory: "hooks" },
				},
				{
					label: "Components",
					items: [
						"components/FieldValue",
						"components/ForEachElement",
						"components/IsSubmitting",
						"components/SubmissionError",
						{
							label: "Form controls",
							autogenerate: { directory: "components/controls" }
						}
					]
				},
			],
			customCss: [
				"./src/styles/theme.css",
			],
		}),
	],
});
