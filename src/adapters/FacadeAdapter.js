import TrailerCodecService from '../domain/services/TrailerCodecService.js';

function normalizeInput(input) {
  if (typeof input === 'string' && input.length > 0) {
    return input;
  }

  throw new TypeError('normalizeInput expects a non-empty string');
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

/**
 * Advanced helper factory (useful for tests or when you need to control the service instance).
 */
export function createMessageHelpers({ service = new TrailerCodecService(), bodyFormatOptions } = {}) {
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

/**
 * @deprecated Use `TrailerCodec` instances for most code paths.
 */
export function decodeMessage(input, bodyFormatOptions) {
  return new TrailerCodec({ bodyFormatOptions }).decode(input);
}

/**
 * @deprecated Use `TrailerCodec` instances for most code paths.
 */
export function encodeMessage(payload, bodyFormatOptions) {
  return new TrailerCodec({ bodyFormatOptions }).encode(payload);
}

/**
 * TrailerCodec is the primary public API; instantiate it to share configuration or a service instance.
 */
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
