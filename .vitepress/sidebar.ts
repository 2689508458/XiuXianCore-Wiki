import { readdirSync, readFileSync } from 'node:fs'
import { extname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

export type SidebarItem = {
  text?: string
  link?: string
  base?: string
  collapsed?: boolean
  items?: SidebarItem[]
}

type Page = {
  relativePath: string
  link: string
  text: string
}

const docsRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const ignoredDirs = new Set([
  '.git',
  '.github',
  '.vitepress',
  'node_modules',
  'public'
])
const collator = new Intl.Collator('zh-CN', {
  numeric: true,
  sensitivity: 'base'
})

export function buildSidebar(manualSidebar: SidebarItem[]): SidebarItem[] {
  const manualLinks = collectManualLinks(manualSidebar)
  const automaticItems = discoverPages()
    .filter((page) => !manualLinks.has(normalizeLink(page.link)))
    .sort((left, right) => collator.compare(left.relativePath, right.relativePath))
    .map(({ text, link }) => ({ text, link }))

  if (automaticItems.length === 0) {
    return manualSidebar
  }
  return [
    ...manualSidebar,
    {
      text: '其他文档（自动收录）',
      collapsed: false,
      items: automaticItems
    }
  ]
}

function collectManualLinks(
  items: SidebarItem[],
  output = new Set<string>(),
  base = '/'
): Set<string> {
  for (const item of items) {
    if (item.link) {
      output.add(normalizeLink(item.link, base))
    }
    const childBase = item.base
      ? item.base.startsWith('/')
        ? item.base
        : `${base.replace(/\/?$/, '/')}${item.base}`
      : base
    if (item.items) {
      collectManualLinks(item.items, output, childBase)
    }
  }
  return output
}

function normalizeLink(link: string, base = '/'): string {
  if (/^(?:[a-z]+:)?\/\//i.test(link)) {
    return link
  }
  const raw = link.split(/[?#]/, 1)[0]
  const full = raw.startsWith('/')
    ? raw
    : `${base.replace(/\/?$/, '/')}${raw}`
  let decoded = full
  try {
    decoded = decodeURIComponent(full)
  } catch {
    return full
  }
  const normalized = decoded
    .replace(/\.(?:md|html)$/i, '')
    .replace(/\/index$/i, '')
  return normalized.replace(/\/+$/, '') || '/'
}

function discoverPages(directory = docsRoot): Page[] {
  const pages: Page[] = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) {
      continue
    }
    const absolute = resolve(directory, entry.name)
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.') && !ignoredDirs.has(entry.name)) {
        pages.push(...discoverPages(absolute))
      }
      continue
    }
    if (!entry.isFile() || extname(entry.name).toLowerCase() !== '.md') {
      continue
    }

    const relativePath = relative(docsRoot, absolute).split(sep).join('/')
    if (relativePath.toLowerCase() === 'index.md') {
      continue
    }
    const source = readFileSync(absolute, 'utf8')
    if (/^autoSidebar:\s*false\s*$/m.test(frontmatterOf(source))) {
      continue
    }
    pages.push(toPage(entry.name, relativePath, source))
  }
  return pages
}

function toPage(fileName: string, relativePath: string, source: string): Page {
  const pathWithoutExtension = relativePath.slice(0, -3)
  const directoryIndex = /(^|\/)index$/i.test(pathWithoutExtension)
  const rawRoute = directoryIndex
    ? `/${pathWithoutExtension.slice(0, -5)}`
    : `/${pathWithoutExtension}`
  const link = rawRoute
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')
  const fallback = fileName.slice(0, -3)
  const parent = relativePath.split('/').slice(0, -1).join(' / ')
  const title = pageTitle(source, fallback)
  return {
    relativePath,
    link,
    text: parent ? `${parent} / ${title}` : title
  }
}

function pageTitle(source: string, fallback: string): string {
  const frontmatterTitle = /^title:\s*(.+?)\s*$/m
    .exec(frontmatterOf(source))?.[1]
  if (frontmatterTitle) {
    return frontmatterTitle.replace(/^(['"])(.*)\1$/, '$2')
  }
  return /^#\s+(.+?)\s*$/m
    .exec(source)?.[1]
    ?.replace(/[`*_]/g, '')
    .trim() || fallback
}

function frontmatterOf(source: string): string {
  return /^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/
    .exec(source)?.[1] || ''
}
