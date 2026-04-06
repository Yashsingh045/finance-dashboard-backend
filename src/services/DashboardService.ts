import { Decimal } from '@prisma/client/runtime/library';
import { RecordType, TrendPeriod, UserRole } from '../entities/enums';
import { RecordRepository } from '../repositories/RecordRepository';
import { RoleStrategyFactory } from '../strategies/RoleStrategyFactory';
import { BaseService } from './BaseService';
import { JwtPayload } from './AuthService';

// Read-only analytics service — no create/update/delete methods.
// ADMIN sees aggregated data across all users; others see only their own records.
export class DashboardService extends BaseService {
  constructor(private readonly recordRepository: RecordRepository) {
    super();
  }

  private getWhereClause(userId: string, user: JwtPayload): Record<string, unknown> {
    const strategy = RoleStrategyFactory.getStrategy(user.role);
    // Admin sees all non-deleted records; everyone else scoped to their userId
    return strategy.canViewAllRecords() ? {} : { userId };
  }

  async getSummary(
    userId: string,
    user: JwtPayload,
  ): Promise<{
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    recordCount: number;
    avgTransaction: number;
  }> {
    const where = this.getWhereClause(userId, user);
    const records = await this.recordRepository.findAll(where);

    let totalIncome = new Decimal(0);
    let totalExpense = new Decimal(0);

    for (const record of records) {
      if (record.getType() === RecordType.INCOME) {
        totalIncome = totalIncome.plus(record.getAmount());
      } else {
        totalExpense = totalExpense.plus(record.getAmount());
      }
    }

    const netBalance = totalIncome.minus(totalExpense);
    const recordCount = records.length;
    const totalAmount = totalIncome.plus(totalExpense);
    const avgTransaction =
      recordCount > 0
        ? parseFloat(totalAmount.dividedBy(recordCount).toFixed(2))
        : 0;

    return {
      totalIncome: parseFloat(totalIncome.toFixed(2)),
      totalExpense: parseFloat(totalExpense.toFixed(2)),
      netBalance: parseFloat(netBalance.toFixed(2)),
      recordCount,
      avgTransaction,
    };
  }

  async getCategoryBreakdown(
    userId: string,
    user: JwtPayload,
  ): Promise<{ categories: { name: string; count: number; amount: number; percent: number }[] }> {
    const where = this.getWhereClause(userId, user);
    const records = await this.recordRepository.findAll(where);

    const map = new Map<string, { count: number; amount: Decimal }>();

    for (const record of records) {
      const cat = record.getCategory();
      const existing = map.get(cat) ?? { count: 0, amount: new Decimal(0) };
      map.set(cat, {
        count: existing.count + 1,
        amount: existing.amount.plus(record.getAmount()),
      });
    }

    const totalAmount = records.reduce(
      (sum, r) => sum.plus(r.getAmount()),
      new Decimal(0),
    );

    const categories = Array.from(map.entries()).map(([name, { count, amount }]) => ({
      name,
      count,
      amount: parseFloat(amount.toFixed(2)),
      percent:
        totalAmount.greaterThan(0)
          ? parseFloat(amount.dividedBy(totalAmount).times(100).toFixed(2))
          : 0,
    }));

    categories.sort((a, b) => b.amount - a.amount);

    return { categories };
  }

  async getTrends(
    userId: string,
    user: JwtPayload,
    period: TrendPeriod = TrendPeriod.MONTHLY,
  ): Promise<{ trends: { period: string; income: number; expense: number }[] }> {
    const where = this.getWhereClause(userId, user);
    const records = await this.recordRepository.findAll(where);

    const map = new Map<string, { income: Decimal; expense: Decimal }>();

    for (const record of records) {
      const key = this.getPeriodKey(record.toJSON().date as string, period);
      const existing = map.get(key) ?? { income: new Decimal(0), expense: new Decimal(0) };

      if (record.getType() === RecordType.INCOME) {
        map.set(key, { ...existing, income: existing.income.plus(record.getAmount()) });
      } else {
        map.set(key, { ...existing, expense: existing.expense.plus(record.getAmount()) });
      }
    }

    const trends = Array.from(map.entries())
      .map(([period, { income, expense }]) => ({
        period,
        income: parseFloat(income.toFixed(2)),
        expense: parseFloat(expense.toFixed(2)),
      }))
      .sort((a, b) => a.period.localeCompare(b.period));

    return { trends };
  }

  async getRecentActivity(
    userId: string,
    user: JwtPayload,
    limit = 10,
  ): Promise<{ activities: ReturnType<import('../entities/FinancialRecord').FinancialRecord['toJSON']>[] }> {
    const where = this.getWhereClause(userId, user);
    const result = await this.recordRepository.findMany(where, 0, Math.min(limit, 50));

    return { activities: result.data.map((r) => r.toJSON()) };
  }

  private getPeriodKey(isoDate: string, period: TrendPeriod): string {
    const d = new Date(isoDate);
    if (period === TrendPeriod.YEARLY) {
      return `${d.getFullYear()}`;
    }
    if (period === TrendPeriod.WEEKLY) {
      // ISO week: YYYY-Www
      const startOfYear = new Date(d.getFullYear(), 0, 1);
      const week = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
      return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
    }
    // Default: MONTHLY — YYYY-MM
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${month}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(_data: unknown): void {
    // No mutable input to validate in a read-only service
  }
}
