module.exports = {
  setupFilesAfterEnv: ['./jest-setup.js'],
  reporters: ['default', 'jest-junit'],
  modulePathIgnorePatterns: ['<rootDir>/.claude/'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/.claude/']
};
