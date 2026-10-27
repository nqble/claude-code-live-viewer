import { describe, expect, test } from 'claude-code/testing'
import type { Item } from '../types'
import { saveFormatOf, toHtml, toMarkdown } from './save'

const ITEMS: Item[] = [
  { type: 'thinking', id: 'a', text: '생각\n둘' },
  { type: 'line', id: 'b', tool: 'Read', args: 'a.ts' },
  {
    type: 'box',
    entry: { id: 'c', tool: 'Bash', status: 'done', title: 'echo <hi>', path: null, kind: 'output', body: '', lastLine: null, meta: 'exit 0' },
    shown: { source: '<hi>', startLine: null, earlier: 0, more: 0 },
  },
]

describe('기록 저장', () => {
  test('save 뒤 형식만 받는다', () => {
    expect([saveFormatOf(''), saveFormatOf('save'), saveFormatOf(' save html '), saveFormatOf('save pdf')]).toEqual([null, 'md', 'html', null])
  })
  test('Markdown은 생각을 인용, 상자를 코드 블록, 할 일을 체크 목록으로', () => {
    const text = toMarkdown('T', ITEMS, [{ content: '하나', status: 'completed', activeForm: null }])
    expect(text).toBe('# T\n\n> 생각\n> 둘\n\n- Read a.ts\n\n### Bash echo <hi> exit 0\n\n````\n<hi>\n````\n\n- [x] 하나\n')
  })
  test('HTML은 글을 이스케이프한다', () => {
    const page = toHtml('T', ITEMS, [])
    expect(page).toContain('<pre>&lt;hi&gt;</pre>')
    expect(page).not.toContain('<hi>')
  })
})
