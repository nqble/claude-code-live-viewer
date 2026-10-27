// 방송·녹화 중에 비밀이 패널에 그대로 찍히지 않게, 그리기 전에 비밀처럼 생긴 글을 ••••로 바꾼다.
// 설정 `mask`(기본 켬)로 끈다. 완벽한 검사가 아니라 흔한 모양만 잡는다: 알려진 토큰 앞머리와,
// 이름이 KEY·TOKEN·SECRET·PASSWORD 낱말로 끝나거나 그 뒤에 _ . -가 오는(tokens 같은 보통 낱말은 빼려고) `이름=값`·`이름: 값` 줄의 값.
import type { Item } from '../types'

export const MASK = '••••'

// 앞머리가 정해진 토큰: OpenAI·Anthropic(sk-), GitHub(ghp_ 등, github_pat_), Slack(xox?-), AWS 키 id(AKIA), JWT(eyJ…).
const TOKEN_SHAPES = [
  /\bsk-[A-Za-z0-9_-]{16,}/g,
  /\bgh[pousr]_[A-Za-z0-9]{20,}/g,
  /\bgithub_pat_[A-Za-z0-9_]{20,}/g,
  /\bxox[abprs]-[A-Za-z0-9-]{10,}/g,
  /\bAKIA[A-Z0-9]{16}\b/g,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
  /\b(Bearer\s+)[A-Za-z0-9._~+/=-]{16,}/g,
]

// 이름 부분은 남기고 값만 가린다. 따옴표는 값과 같이 가린다.
const NAMED_SECRET = /\b([A-Za-z0-9_.-]*(?:KEY|TOKEN|SECRET|PASSWORD|PASSWD)(?:[_.-][A-Za-z0-9_.-]*)?["']?\s*[:=]\s*)(\S+)/gi

export function maskSecrets(text: string): string {
  let masked = text.replace(NAMED_SECRET, (_whole, name: string) => `${name}${MASK}`)
  for (const shape of TOKEN_SHAPES) {
    masked = masked.replace(shape, (_whole, bearer?: string) => `${typeof bearer === 'string' ? bearer : ''}${MASK}`)
  }
  return masked
}

export function maskItem(item: Item): Item {
  if (item.type === 'line') return { ...item, args: maskSecrets(item.args) }
  if (item.type !== 'box') return { ...item, text: maskSecrets(item.text) }
  const entry = { ...item.entry, title: maskSecrets(item.entry.title) }
  return { ...item, entry, shown: { ...item.shown, source: maskSecrets(item.shown.source) } }
}
