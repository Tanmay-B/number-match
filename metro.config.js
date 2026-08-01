const fs = require('fs')
const path = require('path')
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config')

const projectRoot = __dirname

const aliases = {
  '@src': path.resolve(projectRoot, 'src'),
  '@components': path.resolve(projectRoot, 'src/global/components'),
  '@global': path.resolve(projectRoot, 'src/global'),
  '@infra': path.resolve(projectRoot, 'src/infra'),
  '@modules': path.resolve(projectRoot, 'src/modules'),
  '@router': path.resolve(projectRoot, 'src/router'),
  '@store': path.resolve(projectRoot, 'src/store'),
}

const sourceExtensions = ['.tsx', '.ts', '.jsx', '.js', '.json']

function resolveAliasModule(moduleName) {
  const aliasEntries = Object.entries(aliases).sort(
    ([left], [right]) => right.length - left.length,
  )

  for (const [alias, aliasPath] of aliasEntries) {
    if (moduleName !== alias && !moduleName.startsWith(`${alias}/`)) {
      continue
    }

    const subpath =
      moduleName === alias ? '' : moduleName.slice(alias.length + 1)
    const targetBase = subpath ? path.join(aliasPath, subpath) : aliasPath

    if (fs.existsSync(targetBase) && fs.statSync(targetBase).isFile()) {
      return targetBase
    }

    for (const extension of sourceExtensions) {
      const candidate = `${targetBase}${extension}`
      if (fs.existsSync(candidate)) {
        return candidate
      }
    }

    for (const extension of sourceExtensions) {
      const candidate = path.join(targetBase, `index${extension}`)
      if (fs.existsSync(candidate)) {
        return candidate
      }
    }
  }

  return null
}

const defaultConfig = getDefaultConfig(projectRoot)
const defaultResolveRequest = defaultConfig.resolver.resolveRequest

const config = {
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      const aliasedFile = resolveAliasModule(moduleName)
      if (aliasedFile) {
        return { type: 'sourceFile', filePath: aliasedFile }
      }

      if (defaultResolveRequest) {
        return defaultResolveRequest(context, moduleName, platform)
      }

      return context.resolveRequest(context, moduleName, platform)
    },
  },
}

module.exports = mergeConfig(defaultConfig, config)
