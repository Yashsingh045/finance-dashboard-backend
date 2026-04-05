import supertest from 'supertest';
import app from '../../src/app';

// tests/helpers/testClient.ts
// Exports a pre-configured supertest agent bound to the Express app.
// Import this in integration tests instead of raw supertest(app) for consistency.
export const testClient = supertest(app);

// Helper: register and login a user, return the JWT token
export async function loginAs(email: string, password: string): Promise<string> {
  const res = await testClient.post('/api/auth/login').send({ email, password });
  if (res.status !== 200) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(res.body)}`);
  }
  return res.body.data.token as string;
}

// Helper: register a fresh user and return token (for isolated test data)
export async function registerAndLogin(
  email: string,
  password: string,
  name: string,
): Promise<{ token: string; userId: string }> {
  const res = await testClient.post('/api/auth/register').send({ email, password, name });
  if (res.status !== 201) {
    throw new Error(`Register failed: ${JSON.stringify(res.body)}`);
  }
  return {
    token: res.body.data.token as string,
    userId: res.body.data.user.id as string,
  };
}
