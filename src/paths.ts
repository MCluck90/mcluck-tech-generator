import path from 'path'

export const sitePath = path.join(__dirname, '../site')
export const sourcePaths = {
  blog: path.join(sitePath, 'blog'),
  blogTemplate: path.join(sitePath, 'blog', 'template.html')
}
export const distPath = path.join(__dirname, '../dist')
export const distPaths = {
  blog: path.join(distPath, 'blog')
}
