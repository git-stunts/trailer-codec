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

/**
 * Trim whitespace from a commit body segment and optionally keep a trailing newline.
 * @param {string} [body]
 * @param {Object} [options]
 * @param {boolean} [options.keepTrailingNewline=false]
 * @returns {string}
 */
export function formatBodySegment(body, { keepTrailingNewline = false } = {}) {
  const trimmed = (body ?? '').trim();
  if (!trimmed) {
    return '';
  }
  return keepTrailingNewline ? `${trimmed}\n` : trimmed;
}

/**
 * Advanced helper factory for tests or tools that need direct access to helpers.
 */
/**
 * Advanced helper factory for tests or when you need to control the service instance.
 * @param {Object} [options]
 * @param {TrailerCodecService} [options.service] - Optional custom service (defaults to new one).
 * @param {Object} [options.bodyFormatOptions] - Options forwarded to `formatBodySegment`.
 * @returns {{ decodeMessage: (input: string) => { title: string, body: string, trailers: Record<string,string> }, encodeMessage: (payload: { title: string, body?: string, trailers?: Record<string,string> }) => string }}
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
 * Construct a ready-to-use `TrailerCodec` with a fresh service instance.
 * @param {Object} [options]
 * @param {Object} [options.bodyFormatOptions] - Passed to helpers for body trimming.
 * @returns {TrailerCodec}
 */
export function createDefaultTrailerCodec({ bodyFormatOptions } = {}) {
  return new TrailerCodec({ service: new TrailerCodecService(), bodyFormatOptions });
}

/**
 * @deprecated Use `TrailerCodec` instances for most call sites.
 */
/**
 * @deprecated Use `TrailerCodec.decodeMessage` directly.
 * Convenience wrapper that builds a default codec and decodes the message.
 */
export function decodeMessage(message, bodyFormatOptions) {
  return createDefaultTrailerCodec({ bodyFormatOptions }).decodeMessage(message);
}

/**
 * @deprecated Use `TrailerCodec` instances for most call sites.
 */
export function encodeMessage(payload, bodyFormatOptions) {
  return createDefaultTrailerCodec({ bodyFormatOptions }).encodeMessage(payload);
}

/**
 * TrailerCodec is the main public API. Provide a `TrailerCodecService` to reuse configuration
 * and helper instances.
 */
/**
 * TrailerCodec is the main public API for encode/decode through an injectable service.
 */
export default class TrailerCodec {
  /**
   * @param {{ service: TrailerCodecService, bodyFormatOptions?: Object }} options
   */
  constructor({ service, bodyFormatOptions } = {}) {
    if (!service) {
      throw new TypeError('TrailerCodec requires a TrailerCodecService instance');
    }
    this.helpers = createMessageHelpers({ service, bodyFormatOptions });
  }

  /**
   * Decode a raw commit payload.
   * @param {string} input
   */
  decodeMessage(input) {
    return this.helpers.decodeMessage(input);
  }

  /**
   * Encode a payload back into a commit string.
   * @param {Object} payload
   */
  encodeMessage(payload) {
    return this.helpers.encodeMessage(payload);
  }
}
