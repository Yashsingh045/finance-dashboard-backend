import { testClient, loginAs, registerAndLogin } from '../helpers/testClient';
import {
  ADMIN_CREDENTIALS,
  ANALYST_CREDENTIALS,
  VALID_RECORD,
  VALID_EXPENSE,
  randomEmail,
} from '../helpers/fixtures';

// tests/integration/records.test.ts
describe('Financial Records Endpoints', () => {
  let analystToken: string;
  let adminToken: string;
  let analystUserId: string;

  beforeAll(async () => {
    analystToken = await loginAs(ANALYST_CREDENTIALS.email, ANALYST_CREDENTIALS.password);
    adminToken = await loginAs(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);

    // Get analystId from login
    const res = await testClient
      .post('/api/auth/login')
      .send(ANALYST_CREDENTIALS);
    analystUserId = res.body.data.user.id as string;
  });

  describe('POST /api/records', () => {
    it('ANALYST creates a record → 201 with record data', async () => {
      const res = await testClient
        .post('/api/records')
        .set('Authorization', `Bearer ${analystToken}`)
        .send(VALID_RECORD);

      expect(res.status).toBe(201);
      expect(res.body.data.record.type).toBe('INCOME');
      expect(res.body.data.record.category).toBe('SALARY');
      expect(res.body.data.record.isDeleted).toBe(false);
    });

    it('should reject a future date → 400', async () => {
      const futureDate = new Date(Date.now() + 86400000 * 5).toISOString();
      const res = await testClient
        .post('/api/records')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({ ...VALID_RECORD, date: futureDate });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject a negative amount → 400', async () => {
      const res = await testClient
        .post('/api/records')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({ ...VALID_RECORD, amount: -100 });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/records/:id (ownership check)', () => {
    it('ANALYST can retrieve their own record', async () => {
      const createRes = await testClient
        .post('/api/records')
        .set('Authorization', `Bearer ${analystToken}`)
        .send(VALID_RECORD);
      const recordId = createRes.body.data.record.id as string;

      const res = await testClient
        .get(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.record.id).toBe(recordId);
    });

    it("ANALYST cannot retrieve another user's record → 403", async () => {
      // Register a separate analyst user
      const { token: otherToken } = await registerAndLogin(
        randomEmail(),
        'OtherPass123',
        'Other Analyst',
      );

      // Create record as analyst (seeded)
      const createRes = await testClient
        .post('/api/records')
        .set('Authorization', `Bearer ${analystToken}`)
        .send(VALID_RECORD);
      const recordId = createRes.body.data.record.id as string;

      // otherToken user is VIEWER by default — but this tests ownership
      const res = await testClient
        .get(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      // VIEWER sees 403 (not their record, not admin)
      expect(res.status).toBe(403);
    });

    it('ADMIN can retrieve any user record', async () => {
      const createRes = await testClient
        .post('/api/records')
        .set('Authorization', `Bearer ${analystToken}`)
        .send(VALID_RECORD);
      const recordId = createRes.body.data.record.id as string;

      const res = await testClient
        .get(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.record.id).toBe(recordId);
    });

    it('should return 404 for non-existent record', async () => {
      const res = await testClient
        .get('/api/records/non-existent-id-00000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/records with date filters', () => {
    it('filters by startDate and endDate return correct subset', async () => {
      // Create records at known dates
      await testClient
        .post('/api/records')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({ ...VALID_RECORD, date: '2023-06-15T00:00:00.000Z', description: 'June record' });

      await testClient
        .post('/api/records')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({ ...VALID_EXPENSE, date: '2023-09-20T00:00:00.000Z', description: 'September record' });

      const res = await testClient
        .get('/api/records')
        .set('Authorization', `Bearer ${analystToken}`)
        .query({ startDate: '2023-06-01T00:00:00.000Z', endDate: '2023-06-30T23:59:59.000Z' });

      expect(res.status).toBe(200);
      const records = res.body.data.records as Array<{ date: string; description: string }>;
      records.forEach((r) => {
        const d = new Date(r.date);
        expect(d.getFullYear()).toBe(2023);
        expect(d.getMonth()).toBe(5); // June = month index 5
      });
    });

    it('VIEWER gets empty records array', async () => {
      const viewerToken = await loginAs('viewer@finance.dev', 'Viewer@12345');
      const res = await testClient
        .get('/api/records')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.records).toEqual([]);
    });
  });

  describe('DELETE /api/records/:id (soft delete)', () => {
    it('soft-deleted record is not returned in subsequent GET', async () => {
      const createRes = await testClient
        .post('/api/records')
        .set('Authorization', `Bearer ${analystToken}`)
        .send(VALID_RECORD);
      const recordId = createRes.body.data.record.id as string;

      await testClient
        .delete(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      const getRes = await testClient
        .get(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Soft-deleted → not found via normal route
      expect(getRes.status).toBe(404);
    });
  });
});
