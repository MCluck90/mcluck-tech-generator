import fs from 'fs'
import path from 'path'
import Handlebars from 'handlebars'
import MarkdownIt from 'markdown-it'
import mkdirp from 'mkdirp'
import YAML from 'yaml'
import { sourcePaths, distPaths, distPath } from './paths'
import { FrontMatter, BlogPost } from './types'
import * as variables from './variables'

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

export function generateBlog(): BlogPost[] {
  const blogPosts: BlogPost[] = []
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
    if (frontMatter.description === undefined) {
      throw new TypeError(`Must provide a description in the front-matter`)
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
    const permalink = `${variables.siteRoot}/blog${htmlFileName.replace('index.html', '')}`
    const outPath = path.join(distPaths.blog, htmlFileName)
    const html = Handlebars.compile(htmlTemplate)({
      title: frontMatter.title,
      keywords: frontMatter.keywords.join(','),
      date: frontMatter.date,
      post: postContents,
      permalink: permalink,
      siteRoot: variables.siteRoot
    })
    mkdirp.sync(path.dirname(outPath))
    fs.writeFileSync(outPath, html)

    blogPosts.push({ permalink, frontMatter })
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
    path.join(distPath, 'highlight.js.dark.css')
  )
  fs.copyFileSync(
    path.join(__dirname, '..', 'node_modules/highlight.js/styles', `${lightSyntaxTheme}.css`),
    path.join(distPath, 'highlight.js.light.css')
  )

  return blogPosts
}
