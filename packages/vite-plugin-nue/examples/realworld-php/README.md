# Realworld PHP Example

This example demonstrates integrating Nue.js components with a vanilla PHP backend, using the [realworld-ludicrous](https://github.com/JensRoland/realworld-ludicrous) project as a base.

## What This Shows

- **TagInput component**: Interactive tag/chip input for the article editor
- **PHP integration**: Server renders mount points, Vite builds JS
- **Data hydration**: PHP passes initial data via JSON script tags

## Structure

```
realworld-php/
├── frontend/
│   ├── components/
│   │   └── TagInput.nue      # Interactive tag input
│   ├── main.js               # Entry point
│   └── index.html            # Dev server test page
├── php-templates/
│   ├── editor.php            # Article editor with [nue] mount point
│   └── layout.php            # Layout with Vite script includes
├── package.json
└── vite.config.js
```

## Integration Pattern

### 1. PHP Template (Mount Point)

```php
<!-- editor.php -->
<div nue="tag-input"></div>
<script type="application/json"><?= json_encode(['tags' => $article['tagList'] ?? []]) ?></script>
```

### 2. PHP Layout (Script Loading)

```php
<!-- layout.php -->
<?php if (file_exists(__DIR__ . '/../public/dist/manifest.json')): ?>
    <?php
    $manifest = json_decode(file_get_contents(__DIR__ . '/../public/dist/manifest.json'), true);
    $mainJs = $manifest['frontend/main.js']['file'] ?? null;
    ?>
    <?php if ($mainJs): ?>
        <script type="module" src="/dist/<?= $mainJs ?>"></script>
    <?php endif; ?>
<?php endif; ?>
```

### 3. Nue Component

```html
<!-- TagInput.nue -->
<tag-input>
  <input type="text" :onkeydown="handleKey($event)" placeholder="Enter tags">
  <div class="tag-list">
    <span :each="tag in tags" class="tag-pill">
      { tag } <button :onclick="remove(tag)">×</button>
    </span>
  </div>
  <input type="hidden" name="tags" :value="tags.join(',')">

  <script>
    this.tags = this.tags || []
    // ... handlers
  </script>
</tag-input>
```

## Running This Example

To use with realworld-ludicrous:

1. Copy `frontend/` to your project root
2. Copy `package.json` and `vite.config.js` to your project root
3. Update your PHP templates per the examples in `php-templates/`
4. Install and build:

```bash
npm install
npm run build
```

The built files will appear in `app/public/dist/` ready to be served.

## Development Mode

For development with hot reload:

1. Set `APP_ENV=development` in your environment
2. Run `npm run dev` to start Vite dev server
3. Run your PHP server
4. The layout will load from Vite dev server at `localhost:5173`
