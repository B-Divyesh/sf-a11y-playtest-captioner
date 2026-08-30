import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = process.cwd();
const consumer = mkdtempSync(join(tmpdir(), "a11y-captioner-nodenext-"));

try {
  const packed = JSON.parse(execFileSync("npm", ["pack", "--json", "--pack-destination", consumer], {
    cwd: root,
    encoding: "utf8"
  }));
  const tarball = resolve(consumer, packed[0].filename);

  writeFileSync(join(consumer, "package.json"), JSON.stringify({
    name: "a11y-captioner-nodenext-consumer",
    private: true,
    type: "module",
    dependencies: { "a11y-playtest-captioner": `file:${tarball}` },
    devDependencies: { typescript: "5.9.2" }
  }, null, 2));
  writeFileSync(join(consumer, "tsconfig.json"), JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      module: "NodeNext",
      moduleResolution: "NodeNext",
      strict: true,
      noEmit: true
    },
    include: ["index.ts"]
  }, null, 2));
  writeFileSync(join(consumer, "index.ts"), [
    'import { createCaptioner, type CaptionState } from "a11y-playtest-captioner";',
    "const state: CaptionState = {",
    '  id: "bridge", name: "Bridge", descriptions: { en: "The bridge is out." },',
    "  focusOrder: []",
    "};",
    "const captioner = createCaptioner({ states: [state] });",
    'captioner.activate("bridge");',
    "captioner.destroy();"
  ].join("\n"));

  execFileSync("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund"], { cwd: consumer, stdio: "inherit" });
  execFileSync(join(consumer, "node_modules", ".bin", "tsc"), ["--project", "tsconfig.json"], { cwd: consumer, stdio: "inherit" });
  execFileSync(process.execPath, ["--input-type=module", "--eval", [
    'import { createCaptioner } from "a11y-playtest-captioner";',
    'const captioner = createCaptioner({ states: [{ id: "esm", name: "ESM", descriptions: { en: "Ready." } }] });',
    'if (captioner.activate("esm").description !== "Ready.") process.exit(1);',
    "captioner.destroy();"
  ].join("\n")], { cwd: consumer, stdio: "inherit" });
  execFileSync(process.execPath, ["--eval", [
    'const { createCaptioner } = require("a11y-playtest-captioner");',
    'const captioner = createCaptioner({ states: [{ id: "cjs", name: "CJS", descriptions: { en: "Ready." } }] });',
    'if (captioner.activate("cjs").description !== "Ready.") process.exit(1);',
    "captioner.destroy();"
  ].join("\n")], { cwd: consumer, stdio: "inherit" });
} finally {
  rmSync(consumer, { recursive: true, force: true });
}
