import request from "supertest";
import { describe, expect, it } from "@jest/globals";
import { createApp } from "../app";

const app = createApp();

describe("GET /api/health", () => {
  it("returns HTTP 200", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
  });

  it("returns the standard { data } envelope", async () => {
    const res = await request(app).get("/api/health");
    expect(res.body).toHaveProperty("data");
    expect(typeof res.body.data).toBe("object");
  });

  it('has status "ok"', async () => {
    const res = await request(app).get("/api/health");
    expect(res.body.data.status).toBe("ok");
  });

  it("has a valid ISO 8601 timestamp", async () => {
    const res = await request(app).get("/api/health");
    const { timestamp } = res.body.data as { timestamp: string };
    expect(timestamp).toBeTruthy();
    expect(new Date(timestamp).toISOString()).toBe(timestamp);
  });

  it("has a non-empty version string", async () => {
    const res = await request(app).get("/api/health");
    expect(typeof res.body.data.version).toBe("string");
    expect(res.body.data.version.length).toBeGreaterThan(0);
  });
});
