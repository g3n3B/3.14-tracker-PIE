// Checks index.html without a browser:
//  1. Every script block parses.
//  2. Every element the script asks for with $("id") exists in the page.
// Run with: node check-page.js
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);

let ok = true;

scripts.forEach((source, i) => {
  try {
    new vm.Script(source, { filename: `index.html, script ${i + 1}` });
    console.log(`PASS script ${i + 1} parses`);
  } catch (err) {
    ok = false;
    console.log(`FAIL script ${i + 1}: ${err.message}`);
  }
});

const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const asked = new Set([...scripts.join("\n").matchAll(/\$\("([^"]+)"\)/g)].map((m) => m[1]));
const missing = [...asked].filter((id) => !ids.has(id));

if (missing.length) {
  ok = false;
  console.log(`FAIL these ids are used by the script but not in the page: ${missing.join(", ")}`);
} else {
  console.log(`PASS all ${asked.size} element ids used by the script exist`);
}

process.exit(ok ? 0 : 1);
