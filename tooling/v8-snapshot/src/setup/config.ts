import path from 'path'

type SnapshotConfig = {
  appEntryFile: string
  cypressAppSnapshotDir: string
  nodeModulesOnly: boolean
  pathsMapper: (file: string) => string
  projectBaseDir: string
  snapshotCacheDir: string
  snapshotEntryFile: string
  metaFile: string
  minify: boolean
}

const platformString = process.platform

const snapshotCacheBaseDir = path.resolve(__dirname, '..', '..', 'cache')

const projectBaseDir = path.join(__dirname, '..', '..', '..', '..')
const appEntryFile = require.resolve('@packages/server/server-entry.js')

const cypressAppSnapshotDir = (cypressAppPath?: string) => {
  const electronPackageDir = path.join(projectBaseDir, 'packages', 'electron')

  let electronResourcesPath

  if (platformString === 'darwin') {
    cypressAppPath = cypressAppPath ? path.join(cypressAppPath, 'Cypress.app') : path.join(electronPackageDir, 'dist', 'Cypress', 'Cypress.app')
    electronResourcesPath = path.join('Contents', 'Frameworks', 'Electron Framework.framework', 'Versions', 'A', 'Resources')
  } else {
    cypressAppPath = cypressAppPath || path.join(electronPackageDir, 'dist', 'Cypress')
    electronResourcesPath = ''
  }

  return path.join(
    cypressAppPath,
    electronResourcesPath,
  )
}

const pathsMapper = (s: string) => s.replace(/^packages\//, './packages/')

/**
 * @typedef {Object} SnapshotConfig          - Configuration for creating snapshots
 *
 * @property {string} appEntryFile           - the app entry file used to generate the snapshotEntryFile
 *
 * @property {string} cypressAppSnapshotDir  - the location from where the Cypress app loads the snapshot
 * @property {boolean} nodeModulesOnly       - if `true` then no application files are included in the snapshot
 * @property {Function} pathsMapper          - maps paths to work around edge cases
 * @property {string} projectBaseDir         - the base dir of the project being snapshotted
 *
 * @property {string} snapshotCacheDir       - directory where esbuild metadata, snapshot metadata
 *    and snapshot entry file are stored.
 *    This is different for prod vs. dev environments
 *
 * @property {string} snapshotEntryFile      - file used by esbuild to find all files to include in the snapshot.
 *    This file is generated via see lib/gen-entry
 *
 * @property {string} metaFile               -  file used to determine circular references and how to process modules
 *    when generating the snapshot.  This file is generated by esbuild via see lib/gen-meta
 *
 * @property {boolean} minify                - If true then the snapshot is minified
 */

/**
 * Creates a snapshot config tailored to the provided environment
 *
 * @param {string} env - 'dev' | 'prod'
 * @returns {SnapshotConfig} config to be used for all snapshot related tasks
 */
export function createConfig (env: 'dev' | 'prod' = 'prod', cypressAppPath?: string): SnapshotConfig {
  /**
   * If true only node_module dependencies are included in the snapshot. Otherwise app files are included as well
   *
   * Configured via `env`
   */
  const nodeModulesOnly = env === 'dev'
  const minify = env === 'prod'

  const snapshotCacheDir = path.join(snapshotCacheBaseDir, platformString)

  const snapshotEntryFile = path.join(snapshotCacheDir, 'snapshot-entry.js')
  const metaFile = path.join(snapshotCacheDir, 'esbuild-meta.json')

  return {
    appEntryFile,
    cypressAppSnapshotDir: cypressAppSnapshotDir(cypressAppPath),
    metaFile,
    nodeModulesOnly,
    pathsMapper,
    projectBaseDir,
    snapshotCacheDir,
    snapshotEntryFile,
    minify,
  }
}
