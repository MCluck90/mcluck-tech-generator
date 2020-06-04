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
  mkdirp.sync(p)
}

// Generate the blog entries
const htmlTemplate = fs.readFileSync(sourcePaths.blogTemplate).toString()
const files = fs
  .readdirSync(sourcePaths.blog)
  .filter(file => path.extname(file) === '.md')
  .map(fileName => {
    const filePath = path.join(sourcePaths.blog, fileName)
    const contents = fs.readFileSync(filePath).toString()
    return {
      fileName,
      contents
    }
  })

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

for (const { fileName, contents } of files) {
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

  const htmlFileName = fileName.replace('.md', '.html')
  const outPath = path.join(distPaths.blog, htmlFileName)
  const html = htmlTemplate
    .replace('{{title}}', frontMatter.title)
    .replace('{{keywords}}', frontMatter.keywords.join(','))
    .replace('{{date}}', frontMatter.date)
    .replace('{{post}}', postContents)
  fs.writeFileSync(outPath, html)
}

// Copy the highlight.js theme
const syntaxTheme = 'dracula'
fs.copyFileSync(
  path.join(__dirname, '..', 'node_modules/highlight.js/styles', `${syntaxTheme}.css`),
  path.join(_distPath, 'highlight.js.css')
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
