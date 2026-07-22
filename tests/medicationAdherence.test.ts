import { describe, expect, it } from "vitest";

import {
  adherencePercentage,
  expectedDosesForFrequency,
} from "../src/services/medicationAdherence";

describe("medication adherence", () => {
  it("calculates expected doses for supported schedules", () => {
    expect(expectedDosesForFrequency("Daily", 30)).toBe(30);
    expect(expectedDosesForFrequency("Twice daily", 30)).toBe(60);
    expect(expectedDosesForFrequency("Weekly", 30)).toBe(5);
    expect(expectedDosesForFrequency("Monthly", 30)).toBe(1);
    expect(expectedDosesForFrequency("As needed", 30)).toBe(0);
  });

  it("normalizes invalid day ranges", () => {
    expect(expectedDosesForFrequency("Daily", -5)).toBe(0);
    expect(expectedDosesForFrequency("Daily", 7.9)).toBe(7);
  });

  it("returns a bounded percentage", () => {
    expect(adherencePercentage(21, 30)).toBe(70);
    expect(adherencePercentage(50, 30)).toBe(100);
    expect(adherencePercentage(-2, 30)).toBe(0);
    expect(adherencePercentage(5, 0)).toBe(0);
  });
});
