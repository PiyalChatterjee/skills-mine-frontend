export const formatProfilePhotoTimestamp = (date: Date): string => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
};

export const sanitizeProfilePhotoFileNamePart = (value: string): string =>
  value.trim().replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "") || "candidate";