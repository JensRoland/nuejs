# vite-plugin-nue

Vite plugin for compiling [Nue.js](https://nuejs.org) components. Use Nue's HTML-first reactive components with any backend (PHP, Python, Ruby, Go, etc.) via Vite's build pipeline.

## Installation

```bash
npm install vite-plugin-nue nuedom
```

## Quick Start

### 1. Configure Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import nue from 'vite-plugin-nue'

export default defineConfig({
  plugins: [nue()]
})
```

### 2. Write a Component

```html
<!-- src/components/Counter.nue -->
<counter>
  <button :onclick="count++">
    Clicked { count } times
  </button>

  <script>
    this.count = 0
  </script>
</counter>
```

### 3. Use in Your App

```javascript
// src/main.js
import { lib } from './components/Counter.nue'
import { registerAll, mountAll } from 'vite-plugin-nue/mount'
import { mount } from 'nuedom/src/nue.js'

// Make Nue runtime available
window.Nue = { mount }

// Register components
registerAll(lib)

// Mount all [nue] elements when DOM is ready
document.addEventListener('DOMContentLoaded', () => mountAll())
```

### 4. Add Mount Points in HTML

```html
<!-- Any HTML file, from any backend -->
<div nue="counter"></div>
```

## Usage with PHP/Laravel/Django/etc.

This plugin enables Nue components in server-rendered applications:

```php
<!-- PHP template example -->
<div nue="tag-input"></div>
<script type="application/json"><?= json_encode(['tags' => $article->tags]) ?></script>
```

### Build Output

Run Vite build to compile your components:

```bash
npx vite build
```

Include the built files in your server templates:

```html
<script type="module" src="/dist/main.js"></script>
```

## Mounting Conventions

The mounting system follows Nue 3.0 conventions for forward compatibility:

### Mount Targets

Elements with the `[nue]` attribute are mount targets:

```html
<div nue="my-component"></div>
```

### Passing Data

Data can be passed via a sibling JSON script tag:

```html
<div nue="user-card"></div>
<script type="application/json">{"name": "Alice", "role": "Admin"}</script>
```

Or via `data-nue-*` attributes:

```html
<div nue="user-card" data-nue-name="Alice" data-nue-role="Admin"></div>
```

### API

```javascript
import { register, registerAll, mount, mountAll, observe } from 'vite-plugin-nue/mount'

// Register a single component
register('my-component', componentAst)

// Register all components from a compiled .nue file
import { lib } from './components.nue'
registerAll(lib)

// Mount a specific element
mount(element, { data: { foo: 'bar' } })

// Mount all [nue] elements in a root
mountAll(document)

// Watch for dynamically added [nue] elements
const observer = observe(document)
// Later: observer.disconnect()
```

## Plugin Options

```javascript
nue({
  // File extensions to transform (default: ['.nue', '.dhtml'])
  extensions: ['.nue']
})
```

## Example: Tag Input Component

See `examples/TagInput.nue` for a complete interactive component example.

```html
<div nue="tag-input"></div>
<script type="application/json">{"tags": ["javascript", "nue"]}</script>
```

## How It Works

1. **Build time**: The plugin transforms `.nue` files into JavaScript modules using `nuedom`'s compiler
2. **Runtime**: Components are registered and mounted to `[nue]` elements
3. **Hydration**: Data is extracted from JSON script tags or data attributes

This approach works with any backend because:
- The server renders the initial HTML with mount points and data
- Vite compiles components to static JS files
- The browser mounts components client-side

## License

MIT
