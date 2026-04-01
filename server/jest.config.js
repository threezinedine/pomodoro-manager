const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
// Override: Jest runs on the host, so use localhost instead of Docker's 'mysql' hostname
process.env.DATABASE_URL = 'mysql://pomodoro:pomodoro123@localhost:3306/pomodoro';

/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  testTimeout: 15000,
};
