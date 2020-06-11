export interface FrontMatter {
  title: string
  description: string
  date: string // Format: YYYY-MM-DD
  keywords: string[]
}

export interface BlogPost {
  permalink: string
  frontMatter: FrontMatter
}
