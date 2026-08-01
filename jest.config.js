module.exports = {
  preset: 'react-native',
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/global/components/$1',
    '^@global/(.*)$': '<rootDir>/src/global/$1',
    '^@infra/(.*)$': '<rootDir>/src/infra/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@router/(.*)$': '<rootDir>/src/router/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
  },
}
