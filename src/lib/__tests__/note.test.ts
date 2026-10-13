import { describe, expect, it } from 'vitest'
import { deriveFields, htmlToLines, matchesQuery } from '../note'

describe('htmlToLines', () => {
  it('splits block elements and decodes entities', () => {
    expect(htmlToLines('<h1>标题&nbsp;一</h1><p>a &amp; b<br>c</p><ul><li>x</li></ul>')).toEqual([
      '标题 一',
      'a & b',
      'c',
      'x',
    ])
  })

  it('drops empty lines', () => {
    expect(htmlToLines('<h1><br></h1><p></p>')).toEqual([])
  })
})

describe('deriveFields', () => {
  it('uses the first line as title and the rest as snippet', () => {
    const f = deriveFields('<h1>购物</h1><p>牛奶</p><p>面包</p>')
    expect(f.title).toBe('购物')
    expect(f.snippet).toBe('牛奶 面包')
  })

  it('extracts unique #tags, but not mid-word hashes', () => {
    expect(deriveFields('<p>Hi #工作 #work-1 a#b #工作</p>').tags).toEqual(['工作', 'work-1'])
  })
})

describe('matchesQuery', () => {
  it('matches title or snippet case-insensitively', () => {
    const n = { title: 'Hello', snippet: '世界' }
    expect(matchesQuery(n, 'hello')).toBe(true)
    expect(matchesQuery(n, '世')).toBe(true)
    expect(matchesQuery(n, 'nope')).toBe(false)
    expect(matchesQuery(n, '  ')).toBe(true)
  })
})
