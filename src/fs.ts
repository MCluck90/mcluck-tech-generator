import fs from 'fs'
import path from 'path'

export function readdirSyncRecursive(root: string, parent = ''): string[] {
  if (parent[0] === '/') {
    parent = parent.slice(1)
  }
  const rootFiles = fs.readdirSync(root)
  const subFiles = rootFiles
    .filter(name => fs.statSync(path.join(root, name)).isDirectory())
    .map(name => readdirSyncRecursive(path.join(root, name), `${parent}/${name}`))
    .reduce((arr, item) => arr.concat(item), [])
  return rootFiles.concat(subFiles).map(name => `${parent}/${name}`)
}
