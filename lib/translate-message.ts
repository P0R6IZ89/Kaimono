type MessageTranslator = {
  (key: string, values?: Record<string, string | number | Date>): string;
  has?: (key: string) => boolean;
};

export function translateMessage(
  t: MessageTranslator,
  message?: string,
  values?: Record<string, string | number | Date>,
) {
  if (!message) return undefined;

  try {
    if (typeof t.has === "function" && t.has(message)) {
      return t(message, values);
    }

    return t(message, values);
  } catch {
    return message;
  }
}
