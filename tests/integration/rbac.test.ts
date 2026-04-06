import { testClient, loginAs } from '../helpers/testClient';
import {
  ADMIN_CREDENTIALS,
  ANALYST_CREDENTIALS,
  VIEWER_CREDENTIALS,
  VALID_RECORD,
  randomEmail,
} from '../helpers/fixtures';

// Tests the Role-Based Access Control matrix across all role/route combinations.
describe('RBAC Access Control', () => {
  let adminToken: string;
  let analystToken: string;
  let viewerToken: string;
  let createdRecordId: string;

  beforeAll(async () => {
    adminToken = await loginAs(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
    analystToken = await loginAs(ANALYST_CREDENTIALS.email, ANALYST_CREDENTIALS.password);
    viewerToken = await loginAs(VIEWER_CREDENTIALS.email, VIEWER_CREDENTIALS.password);

    // Pre-create a record as analyst for DELETE tests
    const res = await testClient
      .post('/api/records')
      .set('Authorization', `Bearer ${analystToken}`)
      .send(VALID_RECORD);
    createdRecordId = res.body.data?.record?.id ?? '';
  }, 30000);

  describe('Record creation', () => {
    it('VIEWER cannot POST /api/records → 403', async () => {
      const res = await testClient
        .post('/api/records')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send(VALID_RECORD);
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('AUTHORIZATION_ERROR');
    });

    it('ANALYST can POST /api/records → 201', async () => {
      const res = await testClient
        .post('/api/records')
        .set('Authorization', `Bearer ${analystToken}`)
        .send(VALID_RECORD);
      expect(res.status).toBe(201);
      expect(res.body.data.record.id).toBeDefined();
    });
  });

  describe('Record deletion', () => {
    it('ANALYST cannot DELETE /api/records/:id → 403', async () => {
      const res = await testClient
        .delete(`/api/records/${createdRecordId}`)
        .set('Authorization', `Bearer ${analystToken}`);
      expect(res.status).toBe(403);
    });

    it('ADMIN can DELETE /api/records/:id → 200', async () => {
      // Create a fresh record for deletion so it's not already deleted
      const createRes = await testClient
        .post('/api/records')
        .set('Authorization', `Bearer ${analystToken}`)
        .send(VALID_RECORD);
      const recordId = createRes.body.data.record.id as string;

      const res = await testClient
        .delete(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('User management', () => {
    it('non-ADMIN cannot GET /api/users → 403', async () => {
      const analystRes = await testClient
        .get('/api/users')
        .set('Authorization', `Bearer ${analystToken}`);
      expect(analystRes.status).toBe(403);

      const viewerRes = await testClient
        .get('/api/users')
        .set('Authorization', `Bearer ${viewerToken}`);
      expect(viewerRes.status).toBe(403);
    });

    it('ADMIN can GET /api/users → 200', async () => {
      const res = await testClient
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Unauthenticated access', () => {
    it('unauthenticated request to protected route → 401', async () => {
      const res = await testClient.get('/api/records');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('invalid token → 401', async () => {
      const res = await testClient
        .get('/api/records')
        .set('Authorization', 'Bearer invalid-token-here');
      expect(res.status).toBe(401);
    });
  });
});
