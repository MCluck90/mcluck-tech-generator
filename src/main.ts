import fs from 'fs'
import Handlebars from 'handlebars'
import mkdirp from 'mkdirp'
import { ncp } from 'ncp'
import path from 'path'
import rimraf from 'rimraf'
import { generateBlog } from './blog'
import { distPath, distPaths, sitePath } from './paths'
import * as variables from './variables'

if (fs.existsSync(distPath)) {
  for (const file of fs.readdirSync(distPath)) {
    if (file === '.git') {
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
  } else if (path.basename(file) === 'index.mustache') {
    fs.readFile(file, (err, data) => {
      if (err) {
        throw err
      }

      const template = data.toString()
      const result = Handlebars.compile(template)({
        blogPosts,
        toolsAndToys: [
          { title: 'What Should I Eat?', permalink: `${variables.siteRoot}/what-should-i-eat` },
          { title: 'Field of View Demo', permalink: `${variables.siteRoot}/vision-demo` }
        ]
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
