module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  // 30s global timeout — Neon.tech (us-east-1) has high latency from remote regions.
  // Sequential beforeAll hooks do multiple DB round-trips and easily exceed the 5s default.
  testTimeout: 30000,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/server.ts',
    '!src/utils/swagger.ts',
  ],
  coverageThreshold: { global: { lines: 70 } },
};
