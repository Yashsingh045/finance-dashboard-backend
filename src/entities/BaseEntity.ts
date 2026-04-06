// Abstract base for all domain entities — provides id and timestamp fields
// plus the two abstract contracts every entity must implement.
export abstract class BaseEntity {
  protected id: string;
  protected createdAt: Date;
  protected updatedAt: Date;

  constructor(id: string, createdAt: Date, updatedAt: Date) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  getId(): string {
    return this.id;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  /** Returns true if the entity's own invariants are satisfied. */
  abstract validate(): boolean;

  /** Returns a plain object safe for JSON serialisation (no passwords etc.). */
  abstract toJSON(): Record<string, unknown>;
}
