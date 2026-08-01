const plugins = [
  [
    'module-resolver',
    {
      root: ['./'],
      extensions: [
        '.ios.ts',
        '.ios.tsx',
        '.android.ts',
        '.android.tsx',
        '.ts',
        '.tsx',
        '.js',
        '.jsx',
      ],
      alias: {
        '@src': './src',
        '@components': './src/global/components',
        '@global': './src/global',
        '@infra': './src/infra',
        '@modules': './src/modules',
        '@router': './src/router',
        '@store': './src/store',
      },
    },
  ],
  'react-native-reanimated/plugin',
]

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins,
}
