import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const demo = await readFile(resolve("dist/site/demo/index.html"), "utf8");
const required = [
  '<title>Demo — A11y Playtest Captioner</title>',
  'rel="canonical" href="https://a11y-playtest-captioner.sociobot.in/demo"',
  'property="og:title" content="Demo — A11y Playtest Captioner"',
  'name="twitter:title" content="Demo — A11y Playtest Captioner"',
  'property="og:description" content="Try the isolated sample workspace for browser-game caption authoring."',
  'name="twitter:description" content="Try the isolated sample workspace for browser-game caption authoring."'
];

for (const value of required) {
  if (!demo.includes(value)) throw new Error(`Demo build metadata is missing: ${value}`);
}
if ((demo.match(/<h1\b/g) ?? []).length !== 1) throw new Error("The demo build must contain exactly one h1.");

console.log("Demo build metadata and heading surface verified.");
