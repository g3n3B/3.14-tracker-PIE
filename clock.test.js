// Run with: node --test clock.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const c = require("./clock.js");

test("default clock is eight slices starting at one", () => {
  const k = c.makeClock({ name: "Escape" });
  assert.equal(k.slices, 8);
  assert.equal(k.value, 1);
  assert.equal(c.filledSlices(k), 1);
});

test("buttons clamp at the bottom", () => {
  const k = c.makeClock({ name: "Escape", value: 2 });
  c.step(k, -5);
  assert.equal(k.value, 1);
});

test("buttons clamp at the top and finish", () => {
  const k = c.makeClock({ name: "Escape", value: 6 });
  assert.equal(c.step(k, 10), "finished");
  assert.equal(k.value, 8);
  assert.equal(k.finished, true);
});

test("finished clock ignores changes until reopened", () => {
  const k = c.makeClock({ name: "Escape", value: 8 });
  c.step(k, -1);
  assert.equal(k.value, 8);
  c.reopen(k);
  c.step(k, -1);
  assert.equal(k.value, 7);
});

test("typed value below range is rejected", () => {
  const k = c.makeClock({ name: "Escape", value: 3 });
  assert.throws(() => c.setValue(k, 0), RangeError);
  assert.equal(k.value, 3);
});

test("typed value above range is rejected", () => {
  const k = c.makeClock({ name: "Escape", value: 3 });
  assert.throws(() => c.setValue(k, 9), RangeError);
  assert.equal(k.value, 3);
});

test("typed value in range is applied", () => {
  const k = c.makeClock({ name: "Escape", value: 3 });
  c.setValue(k, 6);
  assert.equal(k.value, 6);
});

test("morale can reach zero and triggers mutiny once", () => {
  const k = c.makeClock({ name: "Morale", kind: c.MORALE, value: 3 });
  assert.equal(c.step(k, -10), "mutiny");
  assert.equal(k.value, 0);
  assert.equal(c.step(k, -1), null);
  assert.equal(c.status(k), "Mutiny");
});

test("morale at zero keeps accepting changes and never finishes", () => {
  const k = c.makeClock({ name: "Morale", kind: c.MORALE, value: 0 });
  c.step(k, 8);
  assert.equal(k.value, 8);
  assert.equal(k.finished, false);
});

test("locked clock ignores ticks until unlocked", () => {
  const k = c.makeClock({ name: "Trapped", locked: true, value: 2 });
  assert.equal(c.step(k, 1), null);
  assert.equal(k.value, 2);
  assert.equal(c.status(k), "Locked");
  c.unlock(k);
  c.step(k, 1);
  assert.equal(k.value, 3);
});

test("clock starting at its top is finished", () => {
  const k = c.makeClock({ name: "Done", value: 8 });
  assert.equal(k.finished, true);
});

test("invalid start value is rejected", () => {
  assert.throws(() => c.makeClock({ name: "Bad", value: 0 }), RangeError);
});

test("ids are unique by default", () => {
  assert.notEqual(c.makeClock({ name: "A" }).id, c.makeClock({ name: "A" }).id);
});

test("clock survives a JSON round trip", () => {
  const k = c.makeClock({ name: "Crew", kind: c.MORALE, value: 5, color: "#2e8b57" });
  const restored = JSON.parse(JSON.stringify(k));
  assert.deepEqual(restored, k);
});

test("open-ended counter goes past any number", () => {
  const n = c.makeCounter({ label: "Coin", value: 5 });
  c.stepCounter(n, 1000);
  assert.equal(n.value, 1005);
  assert.equal(c.counterRangeText(n), "no limit");
});

test("counter with limits clamps button changes", () => {
  const n = c.makeCounter({ label: "Supplies", value: 2, min: 0, max: 5 });
  c.stepCounter(n, -10);
  assert.equal(n.value, 0);
  c.stepCounter(n, 10);
  assert.equal(n.value, 5);
});

test("typed counter value outside limits is rejected", () => {
  const n = c.makeCounter({ label: "Enemies", value: 3, min: 0, max: 10 });
  assert.throws(() => c.setCounterValue(n, 11), RangeError);
  assert.equal(n.value, 3);
  c.setCounterValue(n, 7);
  assert.equal(n.value, 7);
});

test("only a minimum or only a maximum is open on the other side", () => {
  assert.equal(c.counterRangeText(c.makeCounter({ value: 4, min: 1 })), "1 or more");
  assert.equal(c.counterRangeText(c.makeCounter({ value: 4, max: 9 })), "9 or less");
});

test("counter starting outside its limits is rejected", () => {
  assert.throws(() => c.makeCounter({ value: 12, min: 0, max: 10 }), RangeError);
  assert.throws(() => c.makeCounter({ value: 1, min: 5, max: 2 }), RangeError);
});

test("faction assignment survives a JSON round trip", () => {
  const k = c.makeClock({ name: "Guards", factionId: "f1" });
  const n = c.makeCounter({ label: "Coin", factionId: "f1" });
  assert.equal(JSON.parse(JSON.stringify(k)).factionId, "f1");
  assert.equal(JSON.parse(JSON.stringify(n)).factionId, "f1");
  assert.equal(c.makeClock({ name: "Solo" }).factionId, null);
});

test("imported values that aren't whole numbers are rejected", () => {
  assert.throws(() => c.makeClock({ name: "X", value: "1\" onfocus=\"x" }), Error);
  assert.throws(() => c.makeCounter({ label: "X", value: "2\" onfocus=\"x" }), Error);
  assert.throws(() => c.makeClock({ name: "X", slices: "8\" x" }), Error);
});

test("a crafted id is replaced with a safe one", () => {
  const k = c.makeClock({ name: "X", id: 'a" onmouseover="alert(1)' });
  assert.match(k.id, /^[A-Za-z0-9_-]{1,40}$/);
  assert.equal(c.isId("ok-id_1"), true);
  assert.equal(c.isId('bad"id'), false);
});

test("bad colors are dropped, good ones kept", () => {
  const k = c.makeClock({ name: "X", color: "red; background:url(http://x)", emptyColor: "#a1b2c3" });
  assert.equal(k.color, "");
  assert.equal(k.emptyColor, "#a1b2c3");
});

test("links with unknown actions or bad targets are dropped", () => {
  const k = c.makeClock({
    name: "X",
    links: [
      { targetId: "abc", action: "reveal" },
      { targetId: "abc", action: "<img src=x onerror=alert(1)>" },
      { targetId: 'x" y', action: "start" },
    ],
  });
  assert.deepEqual(k.links, [{ targetId: "abc", action: "reveal" }]);
});
