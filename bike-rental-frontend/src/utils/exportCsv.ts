export function exportToCsv(
  filename: string,
  rows: Record<string, unknown>[]
) {
  if (!rows.length) {
    return false;
  }

  const headers = Object.keys(rows[0]);

  const escapeCsvValue = (value: unknown) => {
    if (value === null || value === undefined) {
      return "";
    }

    const stringValue = String(value).replace(/"/g, '""');

    return `"${stringValue}"`;
  };

  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => escapeCsvValue(row[header]))
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);

  return true;
}