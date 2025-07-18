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
			favicon: "./src/assets/logo-simple.ico",
			sidebar: [
				{
					label: "Home",
					link: "/"
				},
				{
					label: "Getting started",
					items: [
						"guides/overview",
						"guides/installation",
						"guides/fields",
						"guides/array-fields",
						"guides/native-validation",
						"guides/optimizing-rerenders",
					]
				},
				{
					label: "Hooks",
					autogenerate: { directory: "hooks" },
				},
				{
					label: "Components",
					items: [
						"components/DebugField",
						"components/FieldErrors",
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
