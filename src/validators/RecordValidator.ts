import { z } from 'zod';
import { Category, RecordType } from '../entities/enums';
import { BaseValidator } from './BaseValidator';

// src/validators/RecordValidator.ts
const createRecordSchema = z.object({
  type: z.nativeEnum(RecordType),
  amount: z.number().positive().multipleOf(0.01),
  category: z.nativeEnum(Category),
  // datetime() validates ISO-8601 format; refine() guards against future dates.
  date: z.string().datetime().refine(
    (d) => new Date(d) <= new Date(),
    { message: 'Date cannot be in the future' },
  ),
  description: z.string().max(500).optional(),
});

// date cannot be changed after creation — omit it from the update schema.
const updateRecordSchema = createRecordSchema.partial().omit({ date: true });

export type CreateRecordInput = z.infer<typeof createRecordSchema>;
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;

export class RecordValidator extends BaseValidator {
  validateCreate(data: unknown): CreateRecordInput {
    return this.validate(createRecordSchema, data);
  }

  validateUpdate(data: unknown): UpdateRecordInput {
    return this.validate(updateRecordSchema, data);
  }

  static get createSchema() {
    return createRecordSchema;
  }

  static get updateSchema() {
    return updateRecordSchema;
  }
}
