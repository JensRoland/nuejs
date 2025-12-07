/**
 * Nue.js components for realworld-ludicrous
 *
 * This entry point initializes and mounts all Nue components.
 * Components are mounted to elements with [nue="component-name"] attributes.
 * Data is passed via adjacent <script type="application/json"> tags.
 */

// Import Nue runtime
import { mount } from 'nuedom/src/nue.js'

// Import compiled components
import { lib as tagInputLib } from './components/TagInput.nue'

// Import mount utilities
import { registerAll, mountAll } from 'vite-plugin-nue/mount'

// Make Nue runtime available globally for mount.js
window.Nue = { mount }

// Register all components
registerAll(tagInputLib)

// Mount components when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => mountAll())
} else {
  mountAll()
}

// Log for debugging
console.log('[nue] Components initialized:', Object.keys(tagInputLib.map(c => c.name || c.tag)))
