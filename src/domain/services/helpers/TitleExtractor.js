/**
 * Extracts the title line and the index where the body starts.
 */
/**
 * Extracts the title line and the body start index.
 * @param {string[]} lines – normalized commit lines.
 */
export function extractTitle(lines) {
  const title = (lines[0] || '').trim();
  let nextIndex = 1;
  while (nextIndex < lines.length && lines[nextIndex].trim() === '') {
    nextIndex++;
  }
  return { title, nextIndex };
}
