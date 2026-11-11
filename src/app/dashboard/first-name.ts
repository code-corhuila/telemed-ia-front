// A word ending in a dot ("Dr.", "Dra.") is a title, not a name.
const TITLE = /\.$/;

export function firstName(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);

  return words.find((word) => !TITLE.test(word)) ?? words[0] ?? '';
}
