import fs from 'fs'
import Handlebars from 'handlebars'
import mkdirp from 'mkdirp'
import { ncp } from 'ncp'
import path from 'path'
import rimraf from 'rimraf'
import RSS from 'rss'
import { generateBlog } from './blog'
import { distPath, distPaths, sitePath } from './paths'
import * as variables from './variables'
import { readdirSyncRecursive } from './fs'
import { FeedMetadata } from './types'

if (fs.existsSync(distPath)) {
  for (const file of fs.readdirSync(distPath)) {
    // It's convenient to store the Github pages and some documentation in here
    if (['.git', 'parsnip-ts'].includes(file)) {
      // It's convenient to store the Github pages repo in here
      continue
    }
    rimraf.sync(path.join(distPath, file))
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

// Get blog posts and sort by date
const blogPosts = generateBlog()
blogPosts.sort((a, b) => (a.frontMatter.date < b.frontMatter.date ? 1 : -1))

// Copy everything that isn't the blog
const nonBlogSiteFiles = fs
  .readdirSync(sitePath)
  .filter(name => name !== 'blog')
  .map(name => path.join(sitePath, name))

for (const file of nonBlogSiteFiles) {
  if (fs.statSync(file).isDirectory()) {
    const destination = path.join(distPath, path.basename(file))
    ncp(file, destination, err => {
      if (err) {
        console.error(err)
      }
    })
  } else if (path.basename(file) === 'index.handlebars') {
    fs.readFile(file, (err, data) => {
      if (err) {
        throw err
      }

      const template = data.toString()
      const homepage = require('./homepage.json')
      const result = Handlebars.compile(template)({
        siteRoot: variables.siteRoot,
        blogPosts,
        ...homepage
      })
      fs.writeFile(path.join(distPath, 'index.html'), result, err => {
        if (err) {
          throw err
        }
      })
    })
  } else {
    fs.copyFile(file, path.join(distPath, path.basename(file)), err => {
      if (err) {
        console.error(err)
      }
    })
  }
}

// Generate an RSS feed
const feed = new RSS({
  title: '[Cluckware]',
  feed_url: `${variables.siteRoot}/feed.xml`,
  site_url: variables.siteRoot
})

const nonBlogPostMetadata: FeedMetadata[] = readdirSyncRecursive(sitePath)
  .filter(filePath => path.basename(filePath) === 'metadata.json')
  .map(filePath => require(path.join(sitePath, filePath)))
const nonBlogPostFeedItems = nonBlogPostMetadata
  .map(metadata => {
    return [
      {
        title: metadata.title,
        description: metadata.description,
        url: metadata.url,
        date: metadata.date
      }
    ].concat(
      metadata.updates.map(update => ({
        title: update.title || metadata.title,
        description: update.description || metadata.description,
        url: update.url || metadata.url,
        date: update.date
      }))
    )
  })
  .reduce((arr, items) => arr.concat(items), [])

const feedItems = blogPosts
  .map(post => ({
    title: post.frontMatter.title,
    description: post.frontMatter.description,
    url: post.permalink,
    date: post.frontMatter.date
  }))
  .concat(nonBlogPostFeedItems)
  .sort((a, b) => (a.date < b.date ? 1 : -1))

for (const item of feedItems) {
  feed.item(item)
}

const xml = feed.xml({ indent: true })
fs.writeFileSync(path.join(distPath, 'rss.xml'), xml)
