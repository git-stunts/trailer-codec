import TrailerCodecService from '../domain/services/TrailerCodecService.js';
const defaultService = new TrailerCodecService();

function normalizeInput(input) {
  if (typeof input === 'string') {
    return input;
  }

  throw new TypeError('decode expects a raw string payload');
}

function normalizeTrailers(entity) {
  if (!entity || !Array.isArray(entity.trailers)) {
    throw new TypeError('Invalid entity: trailers array is required');
  }

  return entity.trailers.reduce((acc, trailer) => {
    if (!trailer || typeof trailer.key !== 'string' || trailer.key.trim() === '') {
      throw new TypeError('Invalid trailer: non-empty string key is required');
    }
    if (acc[trailer.key] !== undefined) {
      throw new Error(`Duplicate trailer key detected: "${trailer.key}"`);
    }
    acc[trailer.key] = trailer.value;
    return acc;
  }, {});
}

export function formatBodySegment(body, { keepTrailingNewline = false } = {}) {
  const trimmed = (body ?? '').trim();
  if (!trimmed) {
    return '';
  }
  return keepTrailingNewline ? `${trimmed}\n` : trimmed;
}

export function createMessageHelpers({ service = defaultService, bodyFormatOptions } = {}) {
  function decodeMessage(input) {
    const message = normalizeInput(input);
    const entity = service.decode(message);
    return {
      title: entity.title,
      body: formatBodySegment(entity.body, bodyFormatOptions),
      trailers: normalizeTrailers(entity),
    };
  }

  function encodeMessage({ title, body, trailers = {} }) {
    const trailerArray = Object.entries(trailers).map(([key, value]) => ({ key, value }));
    return service.encode({ title, body, trailers: trailerArray });
  }

  return { decodeMessage, encodeMessage };
}

const helpers = createMessageHelpers();
export const { decodeMessage, encodeMessage } = helpers;

export default class TrailerCodec {
  constructor({ service = new TrailerCodecService(), bodyFormatOptions } = {}) {
    this.helpers = createMessageHelpers({ service, bodyFormatOptions });
  }

  decode(input) {
    return this.helpers.decodeMessage(input);
  }

  encode(payload) {
    return this.helpers.encodeMessage(payload);
  }
}
