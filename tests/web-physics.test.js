const test = require("node:test");
const assert = require("node:assert");

const { project, rubberband, shouldCommit } = require("../web/physics.js");

test("project: Apple momentum projection", () => {
  assert.equal(project(0), 0);
  assert.ok(Math.abs(project(300) - 149.7) < 0.01);
  assert.ok(project(-600) < 0 && Math.abs(project(-600) + 299.4) < 0.01);
});

test("rubberband: progressive resistance", () => {
  assert.equal(rubberband(0, 300), 0);
  assert.ok(rubberband(50, 300) < 50);
  assert.ok(rubberband(400, 300) < 300);
  assert.ok(rubberband(50, 300) < rubberband(100, 300));
});

test("shouldCommit: flick + position decision", () => {
  const w = 300;
  assert.equal(shouldCommit(0, 600, w), true);
  assert.equal(shouldCommit(60, 250, w), true);
  assert.equal(shouldCommit(110, 0, w), true);
  assert.equal(shouldCommit(100, 0, w), false);
  assert.equal(shouldCommit(60, -250, w), false);
});
