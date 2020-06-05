import fs from 'fs'
import mkdirp from 'mkdirp'
import { ncp } from 'ncp'
import path from 'path'
import rimraf from 'rimraf'
import MarkdownIt from 'markdown-it'
import YAML from 'yaml'
import { FrontMatter } from './types'

const _sitePath = path.join(__dirname, '../site')
const sourcePaths = {
  blog: path.join(_sitePath, 'blog'),
  blogTemplate: path.join(_sitePath, 'blog', 'template.html')
}
const _distPath = path.join(__dirname, '../dist')
const distPaths = {
  blog: path.join(_distPath, 'blog')
}

if (fs.existsSync(_distPath)) {
  for (const file of fs.readdirSync(_distPath)) {
    rimraf.sync(path.join(_distPath, file))
  }
}

for (const p of Object.values(distPaths)) {
  // Sometimes it gets hung up when I'm running the live-server
  // Give them a chance to resolve their differences
  for (let i = 0; i < 10; i++) {
    try {
      mkdirp.sync(p)
      break
    } catch {}
  }
}

function readdirSyncRecursive(root: string, parent = ''): string[] {
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

// Generate the blog entries
const htmlTemplate = fs.readFileSync(sourcePaths.blogTemplate).toString()
const blogFiles = readdirSyncRecursive(sourcePaths.blog)
const blogMarkdownFiles = blogFiles
  .filter(file => path.extname(file) === '.md')
  .map(fileName => {
    const filePath = path.join(sourcePaths.blog, fileName)
    const contents = fs.readFileSync(filePath).toString()
    return {
      fileName,
      contents
    }
  })
const blogNonMarkdownFiles = blogFiles.filter(
  file =>
    file !== '/template.html' &&
    path.extname(file) !== '.md' &&
    !fs.statSync(path.join(sourcePaths.blog, file)).isDirectory()
)

function assertValidFrontMatter(
  frontMatter: Partial<FrontMatter>
): asserts frontMatter is FrontMatter {
  if (frontMatter.title === undefined) {
    throw new TypeError(`Must provide a title in the front-matter`)
  }
  if (frontMatter.date === undefined) {
    throw new TypeError(`Must provide a date in the front-matter`)
  }
  if (frontMatter.keywords === undefined) {
    frontMatter.keywords = []
  }
}

for (const { fileName, contents } of blogMarkdownFiles) {
  const md = new MarkdownIt({ html: true })
  const filePath = path.join(sourcePaths.blog, fileName)
  let frontMatter: FrontMatter | null = null
  md.use(require('markdown-it-highlightjs')).use(require('markdown-it-front-matter'), function (
    fm: string
  ) {
    const potentialFrontMatter: Partial<FrontMatter> = YAML.parse(fm)
    try {
      assertValidFrontMatter(potentialFrontMatter)
      frontMatter = potentialFrontMatter
    } catch (e) {
      console.error(`${filePath}: ${e.message}`)
      process.exit(1)
    }
  })

  const postContents = md.render(contents)

  if (frontMatter === null) {
    throw new TypeError(
      `Must provide front matter for ${filePath}. See types.ts for required fields`
    )
  }
  frontMatter = frontMatter as FrontMatter // Goofy hack because TS can't properly infer here

  let htmlFileName = fileName.replace('.md', '.html')
  if (!htmlFileName.endsWith('index.html')) {
    htmlFileName = fileName.replace('.md', '/index.html')
  }
  const outPath = path.join(distPaths.blog, htmlFileName)
  const html = htmlTemplate
    .replace(/{{title}}/g, frontMatter.title)
    .replace(/{{keywords}}/g, frontMatter.keywords.join(','))
    .replace(/{{date}}/g, frontMatter.date)
    .replace(/{{post}}/g, postContents)
  mkdirp.sync(path.dirname(outPath))
  fs.writeFileSync(outPath, html)
}

// Copy any non-markdown files
for (const file of blogNonMarkdownFiles) {
  const directory = path.dirname(file)
  mkdirp.sync(path.join(distPaths.blog, directory))
  fs.copyFileSync(path.join(sourcePaths.blog, file), path.join(distPaths.blog, file))
}

// Copy the highlight.js theme
const darkSyntaxTheme = 'hybrid'
const lightSyntaxTheme = 'idea'
fs.copyFileSync(
  path.join(__dirname, '..', 'node_modules/highlight.js/styles', `${darkSyntaxTheme}.css`),
  path.join(_distPath, 'highlight.js.dark.css')
)
fs.copyFileSync(
  path.join(__dirname, '..', 'node_modules/highlight.js/styles', `${lightSyntaxTheme}.css`),
  path.join(_distPath, 'highlight.js.light.css')
)

// Copy everything that isn't the blog
const nonBlogSiteFiles = fs
  .readdirSync(_sitePath)
  .filter(name => name !== 'blog')
  .map(name => path.join(_sitePath, name))

for (const file of nonBlogSiteFiles) {
  if (fs.statSync(file).isDirectory()) {
    const destination = path.join(_distPath, path.basename(file))
    ncp(file, destination, err => {
      if (err) {
        console.error(err)
      }
    })
  } else {
    fs.copyFile(file, path.join(_distPath, path.basename(file)), err => {
      if (err) {
        console.error(err)
      }
    })
  }
}
