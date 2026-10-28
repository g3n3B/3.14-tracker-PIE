// Clock rules for the D&D clock tracker (browser version).
// No DOM code here, so every rule can be tested directly with Node.

const STANDARD = "standard"; // range 1..slices, finishes at the top
const MORALE = "morale";     // range 0..slices, mutiny at zero

const REVEAL = "reveal";
const START = "start";
const REVEAL_AND_START = "reveal and start";
const LINK_ACTIONS = [REVEAL, START, REVEAL_AND_START];

// Security: data from a saved or imported file is checked before the app uses it.
// Anything that doesn't match these rules is replaced or dropped.
const ID_PATTERN = /^[A-Za-z0-9_-]{1,40}$/;
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;
const LINK_ACTION_LIST = ["reveal", "start", "reveal and start"];

function isId(value) {
  return typeof value === "string" && ID_PATTERN.test(value);
}

function isWhole(value) {
  return Number.isSafeInteger(value);
}

function cleanColor(value) {
  return typeof value === "string" && HEX_COLOR_PATTERN.test(value) ? value : "";
}

function cleanLinks(links) {
  if (!Array.isArray(links)) return [];
  return links
    .filter((l) => l && isId(l.targetId) && LINK_ACTION_LIST.includes(l.action))
    .map((l) => ({ targetId: l.targetId, action: l.action }));
}

function newId() {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function minValue(clock) {
  return clock.kind === MORALE ? 0 : 1;
}

function maxValue(clock) {
  return clock.slices;
}

// Build a clock from partial settings, checking the same rules as the Python version.
function makeClock(options = {}) {
  if (!isWhole(options.slices ?? 8)) throw new Error("Slices must be a whole number");
  if (!isWhole(options.value ?? 1)) throw new Error("Value must be a whole number");
  const clock = {
    id: isId(options.id) ? options.id : newId(),
    name: String(options.name ?? "").slice(0, 60),
    slices: options.slices ?? 8,
    kind: options.kind ?? STANDARD,
    value: options.value ?? 1,
    visible: options.visible !== false,
    locked: options.locked === true,
    links: cleanLinks(options.links),
    finished: options.finished === true,
    color: cleanColor(options.color),
    emptyColor: cleanColor(options.emptyColor),
    outlineColor: cleanColor(options.outlineColor),
    factionId: isId(options.factionId) ? options.factionId : null,
  };
  if (clock.kind !== STANDARD && clock.kind !== MORALE) {
    throw new Error(`Unknown clock kind: ${clock.kind}`);
  }
  if (clock.slices < 1) {
    throw new Error("A clock needs at least one slice");
  }
  if (clock.value < minValue(clock) || clock.value > clock.slices) {
    throw new RangeError(
      `Starting value ${clock.value} is outside ${minValue(clock)}..${clock.slices}`
    );
  }
  if (clock.value === clock.slices && clock.kind === STANDARD) {
    clock.finished = true;
  }
  return clock;
}

// Button changes: clamp to the range. Returns "mutiny", "finished", or null.
function step(clock, amount) {
  if (clock.locked || clock.finished) return null;

  const before = clock.value;
  clock.value = Math.max(minValue(clock), Math.min(maxValue(clock), clock.value + amount));

  if (clock.kind === MORALE && before > 0 && clock.value === 0) return "mutiny";
  if (clock.kind === STANDARD && clock.value === maxValue(clock)) {
    clock.finished = true;
    return "finished";
  }
  return null;
}

// Typed changes: values outside the range are rejected with an error.
function setValue(clock, newValue) {
  if (newValue < minValue(clock) || newValue > maxValue(clock)) {
    throw new RangeError(`${newValue} is outside ${minValue(clock)}..${maxValue(clock)}`);
  }
  if (clock.locked || clock.finished) return null;
  return step(clock, newValue - clock.value);
}

function reopen(clock) {
  clock.finished = false;
}

function unlock(clock) {
  clock.locked = false;
}

function status(clock) {
  if (clock.kind === MORALE && clock.value === 0) return "Mutiny";
  if (clock.locked) return "Locked";
  if (clock.finished) return "Finished";
  return "Active";
}

function filledSlices(clock) {
  return clock.value;
}

// Counters: a labeled number with an optional minimum and maximum.
// A null limit means that side is open-ended.
function makeCounter(options = {}) {
  const min = options.min ?? null;
  const max = options.max ?? null;
  if (!isWhole(options.value ?? 0)) throw new Error("Value must be a whole number");
  if (min !== null && !isWhole(min)) throw new Error("Minimum must be a whole number");
  if (max !== null && !isWhole(max)) throw new Error("Maximum must be a whole number");
  const counter = {
    id: isId(options.id) ? options.id : newId(),
    label: String(options.label ?? "").slice(0, 40),
    value: options.value ?? 0,
    min,
    max,
    visible: options.visible !== false,
    factionId: isId(options.factionId) ? options.factionId : null,
  };
  if (counter.min !== null && counter.max !== null && counter.min > counter.max) {
    throw new RangeError("The minimum can't be more than the maximum");
  }
  if (!counterInRange(counter, counter.value)) {
    throw new RangeError(`Starting value ${counter.value} is outside ${counterRangeText(counter)}`);
  }
  return counter;
}

function counterInRange(counter, value) {
  if (counter.min !== null && value < counter.min) return false;
  if (counter.max !== null && value > counter.max) return false;
  return true;
}

// Buttons clamp to the limits.
function stepCounter(counter, amount) {
  let value = counter.value + amount;
  if (counter.min !== null) value = Math.max(counter.min, value);
  if (counter.max !== null) value = Math.min(counter.max, value);
  counter.value = value;
}

// Typed values outside the limits are rejected.
function setCounterValue(counter, value) {
  if (!counterInRange(counter, value)) {
    throw new RangeError(`${value} is outside ${counterRangeText(counter)}`);
  }
  counter.value = value;
}

function counterRangeText(counter) {
  if (counter.min !== null && counter.max !== null) return `${counter.min} to ${counter.max}`;
  if (counter.min !== null) return `${counter.min} or more`;
  if (counter.max !== null) return `${counter.max} or less`;
  return "no limit";
}

const api = {
  STANDARD, MORALE, REVEAL, START, REVEAL_AND_START, LINK_ACTIONS,
  makeClock, step, setValue, reopen, unlock, status, filledSlices,
  minValue, maxValue,
  makeCounter, stepCounter, setCounterValue, counterInRange, counterRangeText,
  isId, cleanColor,
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = api;
}
