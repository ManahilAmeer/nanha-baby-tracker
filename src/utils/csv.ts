export function escapeCsvValue(value: unknown) {
  if (value === null || value === undefined) return "";

  const stringValue =
    value instanceof Date ? value.toISOString() : String(value);

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  return stringValue;
}

export function rowsToCsv(headers: string[], rows: unknown[][]) {
  return [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ].join("\n");
}
