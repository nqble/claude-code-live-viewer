import { describe, expect, test } from 'claude-code/testing'
import { MASK, maskItem, maskSecrets } from './mask'

describe('비밀 가리기', () => {
  test('이름에 KEY·TOKEN이 든 값과 알려진 토큰 모양을 가린다', () => {
    expect(maskSecrets('API_KEY=abc123\nDEBUG=true')).toBe(`API_KEY=${MASK}\nDEBUG=true`)
    expect(maskSecrets('"github_token": "x1"')).toBe(`"github_token": ${MASK}`)
    expect(maskSecrets(`curl -H "Authorization: Bearer ${'a'.repeat(20)}"`)).toBe(`curl -H "Authorization: Bearer ${MASK}"`)
    expect(maskSecrets(`echo ghp_${'A'.repeat(36)} done`)).toBe(`echo ${MASK} done`)
    expect(maskSecrets('const tokens = count')).toBe('const tokens = count')
  })
  test('상자 제목과 보이는 본문, 한 줄 도구의 인자를 가린다', () => {
    const entry = { id: 'b', tool: 'Bash', status: 'done', title: 'export SECRET=1', path: null, kind: 'output', body: '', lastLine: null, meta: '' } as const
    const box = maskItem({ type: 'box', entry, shown: { source: 'PASSWORD=2', startLine: null, earlier: 0, more: 0 } })
    expect(box.type === 'box' && [box.entry.title, box.shown.source]).toEqual([`export SECRET=${MASK}`, `PASSWORD=${MASK}`])
    expect(maskItem({ type: 'line', id: 'l', tool: 'Read', args: 'TOKEN=3' })).toMatchObject({ args: `TOKEN=${MASK}` })
  })
})
