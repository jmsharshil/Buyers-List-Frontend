export const parseDate = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr.includes("-")) {
    const parts = dateStr.split("-");
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    if (parts[2].length === 4) {
      // DD-MM-YYYY
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
  }
  return new Date(dateStr);
};

export const formatWorkflowName = (key) => {
  if (!key) return "N/A";
  return key
    .split("_")
    .map((word) => {
      const lower = word.toLowerCase();
      if (lower === "gpc" || lower === "tsa" || lower === "ai") {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};
