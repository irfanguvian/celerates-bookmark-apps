module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  forceExit: true,
  setupFilesAfterEnv: ['<rootDir>/src/tests/singleton.ts'],
};
