import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../src/app.js";
import { store } from "../src/store.js";

await store.init();

test("health endpoint responds", async () => {
  const response = await request(app).get("/api/health");
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
});

test("demo intern can login and load dashboard", async () => {
  const login = await request(app).post("/api/auth/login").send({
    email: "intern@internshell.dev",
    password: "Password@123"
  });
  assert.equal(login.status, 200);
  const dashboard = await request(app)
    .get("/api/dashboard")
    .set("Authorization", `Bearer ${login.body.data.token}`);
  assert.equal(dashboard.status, 200);
  assert.ok(dashboard.body.data.recommendations.length);
});

test("public jobs API supports search", async () => {
  const response = await request(app).get("/api/jobs?search=react");
  assert.equal(response.status, 200);
  assert.ok(response.body.data.items.some((job) => job.skills.includes("React")));
});
