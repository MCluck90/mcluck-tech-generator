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

export interface FeedUpdate {
  date: string
  title?: string
  description?: string
  url?: string
}

export interface FeedMetadata {
  title: string
  description: string
  url: string
  date: string
  updates: FeedUpdate[]
}
