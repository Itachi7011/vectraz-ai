export function resolveDateRange(
  range: "today" | "week" | "month" | "year" | "custom",
  customFrom?: Date,
  customTo?: Date
): { from: Date; to: Date } {
  const to = customTo ?? new Date();
  const from = new Date(to);

  switch (range) {
    case "today":
      from.setHours(0, 0, 0, 0);
      break;
    case "week":
      from.setDate(from.getDate() - 7);
      break;
    case "month":
      from.setMonth(from.getMonth() - 1);
      break;
    case "year":
      from.setFullYear(from.getFullYear() - 1);
      break;
    case "custom":
      return { from: customFrom ?? new Date(0), to };
  }

  return { from, to };
}
