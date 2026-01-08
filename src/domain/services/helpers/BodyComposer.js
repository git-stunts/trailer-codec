export default class BodyComposer {
  compose(lines) {
    let start = 0;
    let end = lines.length;

    while (start < end && lines[start].trim() === '') {
      start++;
    }

    while (end > start && lines[end - 1].trim() === '') {
      end--;
    }

    if (start >= end) {
      return '';
    }

    return lines.slice(start, end).join('\n');
  }
}
