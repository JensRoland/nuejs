/**
 * Browser-side mounting utilities for Nue.js components
 *
 * Conventions (compatible with Nue 3.0):
 * - Mount targets use [nue="component-name"] attribute
 * - Data passed via sibling <script type="application/json">
 * - Components registered via register() or imported directly
 *
 * Usage:
 *   import { mountAll, register } from 'vite-plugin-nue/mount'
 *   import { lib as components } from './components.nue'
 *
 *   // Register all components
 *   components.forEach(c => register(c.name || c.tag, c))
 *
 *   // Mount all [nue] elements on page
 *   mountAll()
 */

// Component registry
const registry = {}

/**
 * Register a component for mounting
 * @param {string} name - Component name (matches [nue="name"])
 * @param {object} component - Component AST definition
 */
export function register(name, component) {
  registry[name] = component
}

/**
 * Register multiple components from a lib array
 * @param {Array} lib - Array of component definitions from compiled .nue file
 */
export function registerAll(lib) {
  for (const comp of lib) {
    const name = comp.name || comp.is || comp.tag
    if (name) registry[name] = comp
  }
}

/**
 * Get data from adjacent JSON script tag
 * @param {Element} el - Mount target element
 * @returns {object} Parsed data or empty object
 */
function getData(el) {
  // Check for JSON script as next sibling (3.0 convention)
  const sibling = el.nextElementSibling
  if (sibling?.tagName === 'SCRIPT' && sibling.type === 'application/json') {
    try {
      return JSON.parse(sibling.textContent)
    } catch (e) {
      console.warn('[nue] Failed to parse JSON data:', e)
    }
  }

  // Also check for JSON script as first child
  const child = el.firstElementChild
  if (child?.tagName === 'SCRIPT' && child.type === 'application/json') {
    try {
      return JSON.parse(child.textContent)
    } catch (e) {
      console.warn('[nue] Failed to parse JSON data:', e)
    }
  }

  return {}
}

/**
 * Extract data-nue-* attributes as data
 * @param {Element} el - Mount target element
 * @returns {object} Data from attributes
 */
function getAttrData(el) {
  const data = {}
  for (const attr of el.attributes) {
    if (attr.name.startsWith('data-nue-')) {
      const key = attr.name.slice(9).replace(/-([a-z])/g, (_, c) => c.toUpperCase())
      // Try to parse as JSON, fallback to string
      try {
        data[key] = JSON.parse(attr.value)
      } catch {
        data[key] = attr.value
      }
    }
  }
  return data
}

/**
 * Mount a component to an element
 * @param {Element} el - Target element with [nue] attribute
 * @param {object} options - Mount options
 * @returns {object|null} Mounted component instance or null
 */
export function mount(el, options = {}) {
  const name = el.getAttribute('nue')
  const component = options.component || registry[name]

  if (!component) {
    console.warn(`[nue] Component "${name}" not found in registry`)
    return null
  }

  // Merge data sources: JSON script > data attributes > options
  const data = {
    ...options.data,
    ...getAttrData(el),
    ...getData(el)
  }

  // Import mount from nuedom at runtime
  // This allows the runtime to be loaded separately (e.g., from CDN)
  const { mount: nueMount } = options.nue || window.Nue || {}

  if (!nueMount) {
    console.error('[nue] Nue runtime not found. Include nue.js or pass via options.')
    return null
  }

  return nueMount(component, { root: el, data, deps: options.deps || [] })
}

/**
 * Mount all [nue] elements in a root
 * @param {Element|Document} root - Root to search for [nue] elements
 * @param {object} options - Mount options passed to each mount()
 */
export function mountAll(root = document, options = {}) {
  const elements = root.querySelectorAll('[nue]')

  for (const el of elements) {
    mount(el, options)
  }
}

/**
 * Observe DOM for dynamically added [nue] elements
 * @param {Element|Document} root - Root to observe
 * @param {object} options - Mount options
 * @returns {MutationObserver} Observer instance (call .disconnect() to stop)
 */
export function observe(root = document, options = {}) {
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== 1) continue

        // Check if the added node itself has [nue]
        if (node.hasAttribute?.('nue')) {
          mount(node, options)
        }

        // Check descendants
        const descendants = node.querySelectorAll?.('[nue]')
        if (descendants) {
          for (const el of descendants) {
            mount(el, options)
          }
        }
      }
    }
  })

  observer.observe(root.body || root, { childList: true, subtree: true })
  return observer
}

// Auto-mount on DOMContentLoaded if not in module context
if (typeof window !== 'undefined' && !window.__NUE_NO_AUTO_MOUNT__) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => mountAll())
  } else {
    // DOM already loaded, mount immediately
    mountAll()
  }
}
