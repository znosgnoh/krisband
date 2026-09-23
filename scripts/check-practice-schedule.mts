import assert from "node:assert/strict";
import {
  resolveScheduledAt,
  songsForPlan,
} from "../lib/practice-schedule";
import type { Song } from "../lib/types/song";

// ponytail: runnable check for weekly roll-forward + plan song order
const past = new Date(2026, 8, 16, 20, 0, 0).toISOString();
const from = new Date(2026, 8, 23, 21, 0, 0);
const rolled = new Date(resolveScheduledAt(past, true, from));
assert.equal(rolled.getFullYear(), 2026);
assert.equal(rolled.getMonth(), 8);
assert.equal(rolled.getDate(), 30);
assert.equal(rolled.getHours(), 20);

const stillFuture = resolveScheduledAt(
  new Date(2026, 8, 30, 20, 0, 0).toISOString(),
  true,
  from,
);
assert.equal(new Date(stillFuture).getDate(), 30);

const oneOffPast = resolveScheduledAt(past, false, from);
assert.equal(new Date(oneOffPast).getDate(), 16);

const songs = [
  {
    id: "a",
    title: "A",
    singer: "s",
    addedBy: "b",
    status: "to_practice",
    order: 0,
  },
  {
    id: "b",
    title: "B",
    singer: "s",
    addedBy: "b",
    status: "practicing",
    order: 0,
  },
] satisfies Song[];

assert.deepEqual(
  songsForPlan(songs, ["b", "missing", "a"]).map((song) => song.id),
  ["b", "a"],
);

console.log("practice-schedule check ok");
