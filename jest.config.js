export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  testTimeout: 60000,
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      { 
        useESM: true,
        tsconfig: 'tsconfig.json'
      }
    ]
  },
  transformIgnorePatterns: [
    "/node_modules/"
  ],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
}