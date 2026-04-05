import { testClient, loginAs } from '../helpers/testClient';
import {
  ANALYST_CREDENTIALS,
  ADMIN_CREDENTIALS,
  VIEWER_CREDENTIALS,
  VALID_RECORD,
  VALID_EXPENSE,
} from '../helpers/fixtures';

// tests/integration/dashboard.test.ts
describe('Dashboard Endpoints', () => {
  let analystToken: string;
  let adminToken: string;
  let viewerToken: string;

  beforeAll(async () => {
    analystToken = await loginAs(ANALYST_CREDENTIALS.email, ANALYST_CREDENTIALS.password);
    adminToken = await loginAs(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
    viewerToken = await loginAs(VIEWER_CREDENTIALS.email, VIEWER_CREDENTIALS.password);

    // Ensure there is at least some data for the analyst
    await testClient
      .post('/api/records')
      .set('Authorization', `Bearer ${analystToken}`)
      .send(VALID_RECORD);
    await testClient
      .post('/api/records')
      .set('Authorization', `Bearer ${analystToken}`)
      .send(VALID_EXPENSE);
  });

  describe('GET /api/dashboard/summary', () => {
    it('returns correct totals for analyst after seeded data', async () => {
      const res = await testClient
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.data.totalIncome).toBe('number');
      expect(typeof res.body.data.totalExpense).toBe('number');
      expect(typeof res.body.data.netBalance).toBe('number');
      expect(typeof res.body.data.recordCount).toBe('number');
      expect(typeof res.body.data.avgTransaction).toBe('number');
      expect(res.body.data.recordCount).toBeGreaterThan(0);

      // netBalance should equal totalIncome - totalExpense
      const expected =
        parseFloat(res.body.data.totalIncome.toFixed(2)) -
        parseFloat(res.body.data.totalExpense.toFixed(2));
      expect(parseFloat(res.body.data.netBalance.toFixed(2))).toBeCloseTo(expected, 1);
    });

    it('works for VIEWER (own summary, likely empty)', async () => {
      const res = await testClient
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.recordCount).toBeGreaterThanOrEqual(0);
    });

    it('admin sees aggregated summary across all users', async () => {
      const res = await testClient
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      // Admin data should be at least as large as analyst's data
      const analystRes = await testClient
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.body.data.recordCount).toBeGreaterThanOrEqual(
        analystRes.body.data.recordCount,
      );
    });

    it('returns 401 without token', async () => {
      const res = await testClient.get('/api/dashboard/summary');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/dashboard/trends with period=MONTHLY', () => {
    it('returns monthly breakdown with correct shape', async () => {
      const res = await testClient
        .get('/api/dashboard/trends')
        .set('Authorization', `Bearer ${analystToken}`)
        .query({ period: 'MONTHLY' });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.trends)).toBe(true);

      const trends = res.body.data.trends as Array<{
        period: string;
        income: number;
        expense: number;
      }>;
      trends.forEach((t) => {
        expect(t.period).toMatch(/^\d{4}-\d{2}$/); // YYYY-MM
        expect(typeof t.income).toBe('number');
        expect(typeof t.expense).toBe('number');
      });
    });

    it('defaults to MONTHLY when period is not specified', async () => {
      const res = await testClient
        .get('/api/dashboard/trends')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.trends)).toBe(true);
    });
  });

  describe('GET /api/dashboard/recent-activity', () => {
    it('returns exactly 5 items when limit=5', async () => {
      // Ensure at least 5 records exist
      for (let i = 0; i < 5; i++) {
        await testClient
          .post('/api/records')
          .set('Authorization', `Bearer ${analystToken}`)
          .send({ ...VALID_RECORD, description: `Record ${i + 1}` });
      }

      const res = await testClient
        .get('/api/dashboard/recent-activity')
        .set('Authorization', `Bearer ${analystToken}`)
        .query({ limit: 5 });

      expect(res.status).toBe(200);
      expect(res.body.data.activities.length).toBeLessThanOrEqual(5);

      const analyst2Res = await testClient
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${analystToken}`);
      if (analyst2Res.body.data.recordCount >= 5) {
        expect(res.body.data.activities.length).toBe(5);
      }
    });

    it('returns activities with correct shape', async () => {
      const res = await testClient
        .get('/api/dashboard/recent-activity')
        .set('Authorization', `Bearer ${analystToken}`)
        .query({ limit: 10 });

      expect(res.status).toBe(200);
      const activities = res.body.data.activities as Array<{
        id: string;
        type: string;
        amount: number;
        category: string;
        date: string;
      }>;
      activities.forEach((a) => {
        expect(a.id).toBeDefined();
        expect(['INCOME', 'EXPENSE']).toContain(a.type);
        expect(typeof a.amount).toBe('number');
        expect(typeof a.category).toBe('string');
        expect(typeof a.date).toBe('string');
      });
    });
  });

  describe('GET /api/dashboard/category-breakdown', () => {
    it('returns categories with name/count/amount/percent', async () => {
      const res = await testClient
        .get('/api/dashboard/category-breakdown')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      const categories = res.body.data.categories as Array<{
        name: string;
        count: number;
        amount: number;
        percent: number;
      }>;
      expect(Array.isArray(categories)).toBe(true);
      categories.forEach((c) => {
        expect(typeof c.name).toBe('string');
        expect(typeof c.count).toBe('number');
        expect(typeof c.amount).toBe('number');
        expect(typeof c.percent).toBe('number');
        expect(c.percent).toBeGreaterThanOrEqual(0);
        expect(c.percent).toBeLessThanOrEqual(100);
      });
    });
  });
});
