export default class TitleExtractor {
  extract(lines) {
    const title = lines[0] || '';
    let nextIndex = 1;
    if (nextIndex < lines.length && lines[nextIndex].trim() === '') {
      nextIndex++;
    }
    return { title, nextIndex };
  }
}
