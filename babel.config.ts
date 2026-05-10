module.exports = function (api: {cache: any}) {
  api.cache(true)

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'babel-plugin-react-compiler',
      ['react-native-unistyles/plugin', {
        root: 'app'
      }]
    ]
  }
}
