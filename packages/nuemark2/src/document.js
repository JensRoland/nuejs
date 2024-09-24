
import { parseLinkTitle } from './parse-inline.js'
import { renderBlocks } from './render-blocks.js'
import { parseBlocks } from './parse-blocks.js'
import { load as parseYAML } from 'js-yaml'

export function parseDocument(lines) {
  const meta = stripMeta(lines)
  const blocks = parseBlocks(lines)
  const { reflinks } = blocks

  const self = {

    // title
    get title() {
      const tag = blocks.find(el => el.is_tag)
      return findTitle(blocks) || tag && findTitle(tag.blocks) || ''
    },

    // description
    get description() {
      const block = blocks.find(el => el.is_content)
      return block?.content[0]
    },

    get sections() {
      return blocks && categorize(blocks)
    },


    addReflink(label, href) {
      reflinks.push({ label, ...parseLinkTitle(href) })
    },

    renderSections(classes, opts) {
      const html = []

      self.sections.forEach((blocks, i) => {
        html.push(elem('section', { class: classes[i] }, renderBlocks(blocks, opts)))
      })
      return html.join('\n')
    },

    renderTOC() {
      const navs = self.sections.map(renderNav).join('\n').trim()
      return elem('div', { class: 'toc' }, navs)
    },

    render(opts={}) {
      let { sections } = opts.data || {}
      if (sections && !Array.isArray(sections)) sections = []
      return sections ? self.renderSections(sections, opts) : renderBlocks(blocks, opts)
    },

  }

  return { meta, reflinks, ...self }
}


export function categorize(blocks=[], max_level=2) {
  const arr = []
  let section

  blocks.forEach(el => {
    if (el.level <= max_level) arr.push(section = [])
    section?.push(el)
  })
  return arr[0] && arr
}


function renderNav(blocks) {
  const headings = blocks.filter(b => [2, 3].includes(b.level))
  const links = headings.map(h => elem('a', { href: `#${ h.attr.id }` }, h.text))
  return links[0] ? elem('nav', links.join('\n')) : ''
}

function findTitle(blocks) {
  const h1 = blocks?.find(el => el.level == 1)
  return h1?.text || ''
}

// extracts meta from the head, lines array gets spliced/mutated
export function stripMeta(lines) {
  let start = 0, end = -1

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const is_front = line == '---'
    if (!start) {
      if (is_front) start = i + 1
      else if (line.trim()) return {}
    }
    else if (is_front) { end = i; break }
  }

  if (!start) return {}

  const front = lines.slice(start, end).join('\n')
  lines.splice(0, end + 1)
  return parseYAML(front)
}


/**** utilities ****/
const SELF_CLOSING = ['img', 'source', 'meta', 'link']

export function elem(name, attr, body) {
  if (typeof attr == 'string') { body = attr; attr = null }

  const html = [`<${name}${renderAttrs(attr)}>`]

  if (body) html.push(body)
  if (!SELF_CLOSING.includes(name)) html.push(`</${name}>`)
  return html.join('')
}


function renderAttrs(attr) {
  const arr = []
  for (const key in attr) {
    const val = attr[key]
    if (val) arr.push(val === true ? key :`${key}="${val}"`)
  }
  return arr[0] ? ' ' + arr.join(' ') : ''
}


