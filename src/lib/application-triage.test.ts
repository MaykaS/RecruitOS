import { describe, expect, it } from "vitest";
import { getApplicationInsights, seedData } from "@/lib/recruitos";

describe("application triage", () => {
  it("removes rejected applications from suggestions while preserving their records", () => {
    const data = seedData();
    const application = data.applications[0];
    application.status = "Applied";
    expect(getApplicationInsights(data).some((item) => item.application.id === application.id)).toBe(true);

    application.status = "Rejected";
    expect(getApplicationInsights(data).some((item) => item.application.id === application.id)).toBe(false);
    expect(data.applications).toContain(application);

    application.status = "Interviewing";
    expect(getApplicationInsights(data).some((item) => item.application.id === application.id)).toBe(true);
  });
});
