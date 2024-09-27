
import { renderInline, renderTokens } from './render-inline.js'
import { parseLinkTitle } from './parse-inline.js'
import { parseBlocks } from './parse-blocks.js'
import { renderTag, wrap } from './render-tag.js'
import { elem } from './document.js'
import { glow } from 'nue-glow'


export function renderLines(lines, opts) {
  return renderBlocks(parseBlocks(lines), opts)
}

export function renderBlocks(blocks, opts={}) {
  opts.reflinks = parseReflinks({ ...blocks.reflinks, ...opts?.data?.links })
  return blocks.map(b => renderBlock(b, opts)).join('\n')
}

function renderBlock(block, opts) {
  const fn = opts?.beforerender
  if (fn) fn(block)


  return block.is_content ? renderContent(block.content, opts) :
    block.is_heading ? renderHeading(block, opts) :
    block.is_quote ? elem('blockquote', renderBlocks(block.blocks, opts)) :
    block.is_tag ? renderTag(block, opts) :
    block.is_table ? renderTable(block, opts) :
    block.is_list ? renderList(block, opts) :
    block.is_code ? renderCode(block) :
    block.is_newline ? '' :
    block.is_break ? '<hr>' :
    console.error('Unknown block', block)
}


// recursive
function renderList({ items, numbered }, opts) {
  const html = items.map(blocks => elem('li', renderBlocks(blocks, opts)))
  return elem(numbered ? 'ol' : 'ul', html.join('\n'))
}

function parseReflinks(links) {
  for (const key in links) {
    links[key] = parseLinkTitle(links[key])
  }
  return links
}

export function renderHeading(h, opts={}) {
  const attr = { ...h.attr }
  const show_id = opts.data?.heading_ids
  if (show_id && !attr.id) attr.id = createHeadingId(h.text)

  // anchor
  const a = show_id ? elem('a', { href: `#${ attr.id }`, title: h.text }) : ''

  return elem('h' + h.level, attr, a + renderTokens(h.tokens, opts))
}


export function createHeadingId(text) {
  let hash = text.slice(0, 32).replace(/'/g, '').replace(/[\W_]/g, '-').replace(/-+/g, '-').toLowerCase()
  if (hash[0] == '-') hash = hash.slice(1)
  if (hash.endsWith('-')) hash = hash.slice(0, -1)
  return hash
}

export function renderContent(lines, opts) {
  const html = lines.map(line => renderInline(line, opts)).join(' ')
  return elem('p', html)
}

function renderCode({ name, code, attr, data }) {
  const { numbered } = data
  const klass = attr.class
  delete attr.class
  const pre = elem('pre', attr, glow(code, { language: name, numbered}))
  return wrap(klass, pre)
}

export function renderTable({ rows, attr, head=true }, opts) {

  const html = rows.map((row, i) => {
    const cells = row.map(td => elem(head && !i ? 'th' : 'td', renderInline(td, opts)))
    return elem('tr', cells.join(''))
  })

  return elem('table', attr, html.join('\n'))
}

