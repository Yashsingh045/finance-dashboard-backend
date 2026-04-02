import { UserRole } from '../entities/enums';
import { AdminStrategy } from './AdminStrategy';
import { AnalystStrategy } from './AnalystStrategy';
import { RoleStrategy } from './RoleStrategy';
import { ViewerStrategy } from './ViewerStrategy';

// src/strategies/RoleStrategyFactory.ts
// Static factory: maps a UserRole enum value to its concrete strategy instance.
// Adding a new role = add a new strategy class + one case here. No if/else chains.
export class RoleStrategyFactory {
  static getStrategy(role: UserRole): RoleStrategy {
    switch (role) {
      case UserRole.VIEWER:
        return new ViewerStrategy();
      case UserRole.ANALYST:
        return new AnalystStrategy();
      case UserRole.ADMIN:
        return new AdminStrategy();
      default: {
        // TypeScript exhaustiveness check — if a new enum value is added without
        // a corresponding case, this will cause a compile-time error.
        const _exhaustive: never = role;
        throw new Error(`Unknown role: ${String(_exhaustive)}`);
      }
    }
  }
}
