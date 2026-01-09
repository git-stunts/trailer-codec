import { z } from 'zod';

const schemaRegistry = new Map();

/**
 * Registers a Zod schema under a symbolic name.
 * @param {string} typeId
 * @param {z.ZodTypeAny} schema
 */
export function registerSchema(typeId, schema) {
  if (!typeId || typeof typeId !== 'string') {
    throw new TypeError('typeId must be a non-empty string');
  }
  if (schemaRegistry.has(typeId)) {
    throw new Error(`schema already registered for ${typeId}`);
  }
  schemaRegistry.set(typeId, schema);
}

/**
 * Validates a value using the schema registered for the given type.
 * Throws the underlying ZodError when validation fails.
 * @param {string} typeId
 * @param {unknown} value
 * @returns {unknown}
 */
export function validateType(typeId, value) {
  const schema = schemaRegistry.get(typeId);
  if (!schema) {
    throw new Error(`no schema registered for ${typeId}`);
  }
  const result = schema.safeParse(value);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}

const codecOptionsSchema = z.object({
  keyPattern: z.union([z.string(), z.instanceof(RegExp)]).optional(),
  keyMaxLength: z.number().int().positive().optional(),
});

registerSchema('createConfiguredCodecOptions', codecOptionsSchema);
