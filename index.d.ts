import type { ZodSchema } from 'zod';

export interface GitTrailerJson {
  key: string;
  value: string;
}

export interface GitCommitMessageInput {
  title: string;
  body?: string;
  trailers?: Array<GitTrailerJson | GitTrailer>;
}

export interface MessageFormatters {
  titleFormatter?: (value: string) => string;
  bodyFormatter?: (value: string) => string;
}

export interface GitCommitMessageOptions {
  trailerSchema?: ZodSchema;
  formatters?: MessageFormatters;
}

export class GitCommitMessage {
  constructor(payload: GitCommitMessageInput, options?: GitCommitMessageOptions);

  readonly title: string;
  readonly body: string;
  readonly trailers: GitTrailer[];

  toString(): string;
  toJSON(): {
    title: string;
    body: string;
    trailers: GitTrailerJson[];
  };
}

export class GitTrailer {
  constructor(key: string, value: string, schema?: ZodSchema);

  readonly key: string;
  readonly value: string;

  toString(): string;
  toJSON(): GitTrailerJson;
}

export class TrailerCodecError extends Error {
  constructor(message: string, meta?: Record<string, unknown>);

  readonly meta: Record<string, unknown>;
}

export interface TrailerSchemaBundle {
  schema: ZodSchema<GitTrailerJson>;
  keyPattern: string;
  keyRegex: RegExp;
}

export interface TrailerSchemaBundleOptions {
  keyPattern?: string | RegExp;
  keyMaxLength?: number;
}

export function createGitTrailerSchemaBundle(
  options?: TrailerSchemaBundleOptions
): TrailerSchemaBundle;

export const TRAILER_KEY_RAW_PATTERN_STRING: string;
export const TRAILER_KEY_REGEX: RegExp;

export interface TrailerParserOptions {
  keyPattern?: string;
}

export interface TrailerParserSplitResult {
  trailerStart: number;
  bodyLines: string[];
  trailerLines: string[];
}

export class TrailerParser {
  constructor(options?: TrailerParserOptions);

  readonly lineRegex: RegExp;

  split(lines: string[]): TrailerParserSplitResult;
}

export interface TrailerCodecServiceOptions {
  schemaBundle?: TrailerSchemaBundle;
  trailerFactory?: (key: string, value: string, schema: ZodSchema) => GitTrailer;
  parser?: TrailerParser | null;
  messageNormalizer?: {
    normalizeLines(message: string): string[];
    guardMessageSize(message: string): void;
  };
  titleExtractor?: (lines: string[]) => { title: string; nextIndex: number };
  bodyComposer?: (lines: string[]) => string;
  formatters?: MessageFormatters;
}

export class TrailerCodecService {
  constructor(options?: TrailerCodecServiceOptions);

  readonly schemaBundle: TrailerSchemaBundle;
  readonly parser: TrailerParser;

  decode(message: string): GitCommitMessage;
  decodeAsync(message: string): Promise<GitCommitMessage>;
  encode(messageEntity: GitCommitMessage | GitCommitMessageInput): string;
  encodeAsync(messageEntity: GitCommitMessage | GitCommitMessageInput): Promise<string>;
}

export interface BodyFormatOptions {
  keepTrailingNewline?: boolean;
}

export function formatBodySegment(body?: string | null, options?: BodyFormatOptions): string;

export interface TrailerCodecPayload {
  title: string;
  body?: string;
  trailers?: Record<string, string>;
}

export interface TrailerCodecDecodedMessage {
  title: string;
  body: string;
  trailers: Record<string, string>;
}

export interface TrailerMessageHelpers {
  decodeMessage(input: string): TrailerCodecDecodedMessage;
  encodeMessage(payload: TrailerCodecPayload): string;
  decodeMessageAsync(input: string): Promise<TrailerCodecDecodedMessage>;
  encodeMessageAsync(payload: TrailerCodecPayload): Promise<string>;
}

export interface CreateMessageHelpersOptions {
  service?: Pick<TrailerCodecService, 'decode' | 'encode' | 'decodeAsync' | 'encodeAsync'>;
  bodyFormatOptions?: BodyFormatOptions;
}

export function createMessageHelpers(options?: CreateMessageHelpersOptions): TrailerMessageHelpers;

export interface TrailerCodecOptions {
  service: TrailerCodecService;
  bodyFormatOptions?: BodyFormatOptions;
}

export class TrailerCodec {
  constructor(options: TrailerCodecOptions);

  decodeMessage(input: string): TrailerCodecDecodedMessage;
  encodeMessage(payload: TrailerCodecPayload): string;
  decode(input: string): TrailerCodecDecodedMessage;
  encode(payload: TrailerCodecPayload): string;

  decodeMessageAsync(input: string): Promise<TrailerCodecDecodedMessage>;
  encodeMessageAsync(payload: TrailerCodecPayload): Promise<string>;
  decodeAsync(input: string): Promise<TrailerCodecDecodedMessage>;
  encodeAsync(payload: TrailerCodecPayload): Promise<string>;
}

export function decodeMessage(
  message: string,
  bodyFormatOptions?: BodyFormatOptions
): TrailerCodecDecodedMessage;

export function encodeMessage(
  payload: TrailerCodecPayload,
  bodyFormatOptions?: BodyFormatOptions
): string;

export function decodeMessageAsync(
  message: string,
  bodyFormatOptions?: BodyFormatOptions
): Promise<TrailerCodecDecodedMessage>;

export function encodeMessageAsync(
  payload: TrailerCodecPayload,
  bodyFormatOptions?: BodyFormatOptions
): Promise<string>;

export interface ConfiguredCodecOptions {
  keyPattern?: string | RegExp;
  keyMaxLength?: number;
  parserOptions?: TrailerParserOptions;
  formatters?: MessageFormatters;
  bodyFormatOptions?: BodyFormatOptions;
}

export interface ConfiguredCodec {
  service: TrailerCodecService;
  helpers: TrailerMessageHelpers;
  decodeMessage: TrailerMessageHelpers['decodeMessage'];
  encodeMessage: TrailerMessageHelpers['encodeMessage'];
  decodeMessageAsync: TrailerMessageHelpers['decodeMessageAsync'];
  encodeMessageAsync: TrailerMessageHelpers['encodeMessageAsync'];
}

export function createConfiguredCodec(options?: ConfiguredCodecOptions): ConfiguredCodec;
