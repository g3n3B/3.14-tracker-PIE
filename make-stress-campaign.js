// Makes a large test campaign to check the page stays responsive.
// Run with: node make-stress-campaign.js
// Then in the page: Import, and choose stress-campaign.json.
const fs = require("fs");
const path = require("path");

const COLORS = ["#2e6b4f", "#4b5d73", "#b8862b", "#9b4b3a", "#6e4a6b", "#2f7f7a"];
const clocks = [];
const counters = [];
const factions = [];

for (let f = 0; f < 5; f++) {
  factions.push({ id: `faction${f}`, name: `Faction ${f + 1}`, notes: "Stress test group" });
}

for (let i = 0; i < 60; i++) {
  const slices = 4 + (i % 9);
  clocks.push({
    id: `clock${i}`,
    name: `Clock ${i + 1}`,
    slices,
    kind: i % 7 === 0 ? "morale" : "standard",
    value: i % 7 === 0 ? slices : 1 + (i % (slices - 1)),
    visible: i % 3 !== 0,
    locked: false,
    labels: [],
    links: [],
    finished: false,
    color: i % 2 ? COLORS[i % COLORS.length] : "",
    emptyColor: "",
    outlineColor: "",
    factionId: i % 4 === 0 ? `faction${i % 5}` : null,
  });
}

for (let i = 0; i < 30; i++) {
  counters.push({
    id: `counter${i}`,
    label: `Counter ${i + 1}`,
    value: 5,
    min: i % 2 ? 0 : null,
    max: i % 3 ? 20 : null,
    visible: true,
    factionId: i % 5 === 0 ? `faction${i % 5}` : null,
  });
}

const campaign = { version: 4, clocks, counters, factions, notes: "Stress test campaign." };
const out = path.join(__dirname, "stress-campaign.json");
fs.writeFileSync(out, JSON.stringify(campaign, null, 2));
console.log(`Wrote ${out}: ${clocks.length} clocks, ${counters.length} counters, ${factions.length} factions.`);
