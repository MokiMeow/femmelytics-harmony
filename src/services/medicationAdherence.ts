export function expectedDosesForFrequency(frequency: string, days: number): number {
  const trackedDays = Math.max(0, Math.floor(days));
  switch (frequency) {
    case "Daily":
      return trackedDays;
    case "Twice daily":
      return trackedDays * 2;
    case "Weekly":
      return Math.ceil(trackedDays / 7);
    case "Monthly":
      return Math.ceil(trackedDays / 30);
    case "As needed":
      return 0;
    default:
      return trackedDays;
  }
}

export function adherencePercentage(actualDoses: number, expectedDoses: number): number {
  if (expectedDoses <= 0) return 0;
  const percentage = Math.round((Math.max(0, actualDoses) / expectedDoses) * 100);
  return Math.min(100, percentage);
}
