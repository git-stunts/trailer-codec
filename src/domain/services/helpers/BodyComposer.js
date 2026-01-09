/**
 * Trims leading/trailing blank lines from the decoded body block while preserving interior spacing.
 */
/**
 * Trim leading/trailing blank lines while preserving interior spacing.
 * @param {string[]} lines
 * @returns {string}
 */
export function composeBody(lines) {
  let startIndex = 0;
  let endIndex = lines.length;

  while (startIndex < endIndex && lines[startIndex].trim() === '') {
    startIndex++;
  }

  while (endIndex > startIndex && lines[endIndex - 1].trim() === '') {
    endIndex--;
  }

  if (startIndex >= endIndex) {
    return '';
  }

  return lines.slice(startIndex, endIndex).join('\n');
}
