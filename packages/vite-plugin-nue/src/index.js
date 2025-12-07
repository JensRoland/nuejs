/**
 * Vite plugin for compiling Nue.js components
 *
 * Transforms .nue files into JavaScript modules that export
 * a `lib` array of component definitions.
 *
 * Usage:
 *   import nue from 'vite-plugin-nue'
 *   export default defineConfig({
 *     plugins: [nue()]
 *   })
 */

import { compileNue } from 'nuedom'

const NUE_EXTENSIONS = ['.nue', '.dhtml']

export default function nuePlugin(options = {}) {
  const extensions = options.extensions || NUE_EXTENSIONS

  return {
    name: 'vite-plugin-nue',

    // Resolve .nue imports
    resolveId(id) {
      if (extensions.some(ext => id.endsWith(ext))) {
        return null // Let Vite handle resolution
      }
    },

    // Transform .nue files to JS
    transform(code, id) {
      if (!extensions.some(ext => id.endsWith(ext))) {
        return null
      }

      try {
        const compiled = compileNue(code)
        return {
          code: compiled,
          map: null // TODO: source map support
        }
      } catch (err) {
        this.error(`Failed to compile ${id}: ${err.message}`)
      }
    },

    // Handle HMR for .nue files
    handleHotUpdate({ file, server }) {
      if (extensions.some(ext => file.endsWith(ext))) {
        server.ws.send({
          type: 'full-reload',
          path: '*'
        })
        return []
      }
    }
  }
}

export { nuePlugin }
