// `/live save`(Markdown)와 `/live save html`(브라우저에서 PDF로 인쇄할 수 있는 한 장짜리 쪽)이 쓰는 글을 만든다.
// 패널이 지금 들고 있는 항목만 쓴다(상자 본문은 패널에 보이는 창 그대로). 파일 쓰기는 register.tsx가 한다.
import type { Item, Todo } from '../types'

export type SaveFormat = 'md' | 'html'

// `save`, `save md`, `save html`만 받는다. 그 밖은 null(그냥 탭 열기).
export function saveFormatOf(args: string): SaveFormat | null {
  const [verb, format = 'md'] = args.trim().split(/\s+/)
  if (verb !== 'save') return null
  return format === 'html' ? 'html' : format === 'md' ? 'md' : null
}

const FENCE = '````'
const TODO_MARK = { completed: '[x]', in_progress: '[~]', pending: '[ ]' } as const

function itemToMarkdown(item: Item): string {
  if (item.type === 'line') return `- ${item.tool} ${item.args}`
  if (item.type === 'thinking') return item.text.split('\n').map(line => `> ${line}`).join('\n')
  if (item.type === 'text') return item.text
  const { entry, shown } = item
  const head = `### ${entry.tool} ${entry.title} ${entry.meta}`.trimEnd()
  if (shown.source === '') return head
  const language = entry.kind === 'diff' ? 'diff' : ''
  return `${head}\n\n${FENCE}${language}\n${shown.source}\n${FENCE}`
}

export function toMarkdown(title: string, items: readonly Item[], todos: readonly Todo[]): string {
  const parts = [`# ${title}`, ...items.map(itemToMarkdown)]
  if (todos.length > 0) parts.push(todos.map(todo => `- ${TODO_MARK[todo.status]} ${todo.content}`).join('\n'))
  return `${parts.join('\n\n')}\n`
}

const escapeHtml = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

function itemToHtml(item: Item): string {
  if (item.type === 'line') return `<p class="line"><b>${escapeHtml(item.tool)}</b> ${escapeHtml(item.args)}</p>`
  if (item.type === 'thinking') return `<blockquote>${escapeHtml(item.text)}</blockquote>`
  if (item.type === 'text') return `<p class="text">${escapeHtml(item.text)}</p>`
  const { entry, shown } = item
  const head = `<h3>${escapeHtml(`${entry.tool} ${entry.title} ${entry.meta}`.trimEnd())}</h3>`
  return shown.source === '' ? head : `${head}<pre>${escapeHtml(shown.source)}</pre>`
}

// 스크립트·바깥 글꼴 없이 한 파일로 끝난다. 인쇄할 때 상자가 쪽 사이에서 잘리지 않게 한다.
const STYLE = `body{font:14px/1.5 system-ui,sans-serif;max-width:900px;margin:2em auto;padding:0 1em;color:#222}
pre{background:#f5f5f5;padding:.6em;white-space:pre-wrap;word-break:break-word;break-inside:avoid}
blockquote{color:#666;margin:0;padding-left:1em;border-left:3px solid #ccc;white-space:pre-wrap}
.text{white-space:pre-wrap}h3{font-size:14px;margin:1.2em 0 .3em}`

export function toHtml(title: string, items: readonly Item[], todos: readonly Todo[]): string {
  const body = items.map(itemToHtml)
  if (todos.length > 0) {
    const rows = todos.map(todo => `<li>${TODO_MARK[todo.status]} ${escapeHtml(todo.content)}</li>`).join('')
    body.push(`<ul>${rows}</ul>`)
  }
  const head = `<meta charset="utf-8"><title>${escapeHtml(title)}</title><style>${STYLE}</style>`
  return `<!doctype html>\n<html><head>${head}</head><body><h1>${escapeHtml(title)}</h1>\n${body.join('\n')}\n</body></html>\n`
}
