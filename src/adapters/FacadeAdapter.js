import TrailerCodecService from '../domain/services/TrailerCodecService.js';
import TrailerInvalidError from '../domain/errors/TrailerInvalidError.js';

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
    if (typeof trailer.value !== 'string') {
      throw new TrailerInvalidError('Trailer value must be a string', {
        key: trailer.key,
        invalidValue: trailer.value,
        valueType: typeof trailer.value,
      });
    }
    if (acc[trailer.key] !== undefined) {
      throw new TrailerInvalidError(`Duplicate trailer key: "${trailer.key}"`, {
        key: trailer.key,
        existingValue: acc[trailer.key],
        duplicateValue: trailer.value,
      });
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
 * @returns {{ decodeMessage: (input: string) => Promise<{ title: string, body: string, trailers: Record<string,string> }>, encodeMessage: (payload: { title: string, body?: string, trailers?: Record<string,string> }) => Promise<string> }}
 */
export function createMessageHelpers({ service = new TrailerCodecService(), bodyFormatOptions } = {}) {
  function decode(input) {
    const message = normalizeInput(input);
    const entity = service.decode(message);
    return {
      title: entity.title,
      body: formatBodySegment(entity.body, bodyFormatOptions),
      trailers: normalizeTrailers(entity),
    };
  }

  function encode({ title, body, trailers = {} }) {
    const trailerArray = Object.entries(trailers).map(([key, value]) => ({ key, value }));
    return service.encode({ title, body, trailers: trailerArray });
  }

  async function decodeAsync(input) {
    const message = normalizeInput(input);
    const entity = await service.decodeAsync(message);
    return {
      title: entity.title,
      body: formatBodySegment(entity.body, bodyFormatOptions),
      trailers: normalizeTrailers(entity),
    };
  }

  async function encodeAsync({ title, body, trailers = {} }) {
    const trailerArray = Object.entries(trailers).map(([key, value]) => ({ key, value }));
    return await service.encodeAsync({ title, body, trailers: trailerArray });
  }

  return {
    decodeMessage: decode,
    encodeMessage: encode,
    decodeMessageAsync: decodeAsync,
    encodeMessageAsync: encodeAsync,
  };
}

/**
 * TrailerCodec is the main public API. Provide a `TrailerCodecService` to reuse configuration
 * and helper instances.
 */
/**
 * TrailerCodec is the main public API for encode/decode through an injectable service.
 */
class TrailerCodec {
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
   * @returns {Object}
   */
  decodeMessage(input) {
    return this.helpers.decodeMessage(input);
  }

  /**
   * Encode a payload back into a commit string.
   * @param {Object} payload
   * @returns {string}
   */
  encodeMessage(payload) {
    return this.helpers.encodeMessage(payload);
  }

  /**
   * Convenience alias for decodeMessage.
   * @param {string} input
   * @returns {Object}
   */
  decode(input) {
    return this.decodeMessage(input);
  }

  /**
   * Convenience alias for encodeMessage.
   * @param {Object} payload
   * @returns {string}
   */
  encode(payload) {
    return this.encodeMessage(payload);
  }

  /**
   * Decode a raw commit payload asynchronously.
   * @param {string} input
   * @returns {Promise<Object>}
   */
  async decodeMessageAsync(input) {
    return this.helpers.decodeMessageAsync(input);
  }

  /**
   * Encode a payload back into a commit string asynchronously.
   * @param {Object} payload
   * @returns {Promise<string>}
   */
  async encodeMessageAsync(payload) {
    return this.helpers.encodeMessageAsync(payload);
  }

  /**
   * Convenience alias for decodeMessageAsync.
   * @param {string} input
   * @returns {Promise<Object>}
   */
  async decodeAsync(input) {
    return this.decodeMessageAsync(input);
  }

  /**
   * Convenience alias for encodeMessageAsync.
   * @param {Object} payload
   * @returns {Promise<string>}
   */
  async encodeAsync(payload) {
    return this.encodeMessageAsync(payload);
  }
}

export default TrailerCodec;

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
 * @returns {Object}
 */
export function decodeMessage(message, bodyFormatOptions) {
  return createDefaultTrailerCodec({ bodyFormatOptions }).decodeMessage(message);
}

/**
 * @deprecated Use `TrailerCodec` instances for most call sites.
 * @returns {string}
 */
export function encodeMessage(payload, bodyFormatOptions) {
  return createDefaultTrailerCodec({ bodyFormatOptions }).encodeMessage(payload);
}

/**
 * Convenience wrapper that builds a default codec and decodes the message asynchronously.
 * @returns {Promise<Object>}
 */
export async function decodeMessageAsync(message, bodyFormatOptions) {
  return await createDefaultTrailerCodec({ bodyFormatOptions }).decodeMessageAsync(message);
}

/**
 * Convenience wrapper that builds a default codec and encodes the message asynchronously.
 * @returns {Promise<string>}
 */
export async function encodeMessageAsync(payload, bodyFormatOptions) {
  return await createDefaultTrailerCodec({ bodyFormatOptions }).encodeMessageAsync(payload);
}
