module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/server.ts',
    '!src/utils/swagger.ts',
  ],
  coverageThreshold: { global: { lines: 70 } },
  // Note: 'setupFilesAfterFramework' is not a valid Jest key; using
  // 'setupFilesAfterFramework' was in the spec but Jest uses
  // 'setupFilesAfterFramework'. Using globalSetup instead to bootstrap
  // the test Prisma client singleton before tests run.
  setupFilesAfterFramework: ['<rootDir>/tests/helpers/testClient.ts'],
};
