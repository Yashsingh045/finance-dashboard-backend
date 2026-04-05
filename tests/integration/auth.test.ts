import { testClient, loginAs, registerAndLogin } from '../helpers/testClient';
import { randomEmail } from '../helpers/fixtures';

// tests/integration/auth.test.ts
describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register with valid data and return 201 with token', async () => {
      const email = randomEmail();
      const res = await testClient.post('/api/auth/register').send({
        email,
        password: 'ValidPass123',
        name: 'Test User',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(email);
      expect(res.body.data.user.role).toBe('VIEWER');
      // Ensure password never leaks
      expect(res.body.data.user.hashedPassword).toBeUndefined();
    });

    it('should return 409 when registering with a duplicate email', async () => {
      const email = randomEmail();
      await testClient.post('/api/auth/register').send({
        email,
        password: 'ValidPass123',
        name: 'First User',
      });

      const res = await testClient.post('/api/auth/register').send({
        email,
        password: 'AnotherPass123',
        name: 'Second User',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT_ERROR');
    });

    it('should return 400 when password is too short (< 8 chars)', async () => {
      const res = await testClient.post('/api/auth/register').send({
        email: randomEmail(),
        password: 'short',
        name: 'Test User',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when email is invalid', async () => {
      const res = await testClient.post('/api/auth/register').send({
        email: 'not-an-email',
        password: 'ValidPass123',
        name: 'Test User',
      });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when name is missing', async () => {
      const res = await testClient.post('/api/auth/register').send({
        email: randomEmail(),
        password: 'ValidPass123',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials and return 200 with token', async () => {
      const email = randomEmail();
      await testClient.post('/api/auth/register').send({
        email,
        password: 'ValidPass123',
        name: 'Login Test',
      });

      const res = await testClient.post('/api/auth/login').send({
        email,
        password: 'ValidPass123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(email);
    });

    it('should return 401 with wrong password', async () => {
      const email = randomEmail();
      await testClient.post('/api/auth/register').send({
        email,
        password: 'ValidPass123',
        name: 'Wrong Pass Test',
      });

      const res = await testClient.post('/api/auth/login').send({
        email,
        password: 'WrongPassword99',
      });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should return 401 for non-existent email', async () => {
      const res = await testClient.post('/api/auth/login').send({
        email: 'nobody@nowhere.dev',
        password: 'SomePassword123',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return 401 without a token', async () => {
      const res = await testClient.post('/api/auth/logout');
      expect(res.status).toBe(401);
    });

    it('should return 200 with a valid token', async () => {
      const { token } = await registerAndLogin(randomEmail(), 'ValidPass123', 'Logout User');
      const res = await testClient
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.message).toBe('Logged out successfully');
    });
  });
});
