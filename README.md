## 🚀 Getting Started

### 📦 Installation

```bash
npm install
```

Installs all required development dependencies.

---

### 🧪 Development

```bash
npm start
# or
npx gulp watch
```

Starts the development server with:

- SCSS compilation
- JavaScript transpiling
- Image optimization
- Live reload via BrowserSync

---

### 🏗️ Building for Production

```bash
npm run build
# or
npx gulp
```

Outputs an optimized, cache-busted build in the `/build` folder:

- Minified CSS/JS
- Purged unused styles
- Optimized images (JPEG/PNG/WebP)
- Final HTML with cache-busting

---

### 🔧 Gulp Task Reference

| Command        | Description                       |
| -------------- | --------------------------------- |
| `gulp`         | Clean + build everything          |
| `gulp watch`   | Start dev server with live reload |
| `gulp clean`   | Delete the `/build` folder        |
| `gulp styles`  | Compile and purge SCSS to CSS     |
| `gulp scripts` | Transpile and bundle JS           |
| `gulp images`  | Optimize images                   |
| `gulp favicon` | Copy favicon                      |

---

## 🛠️ Tools & Technologies

- **[Gulp 4](https://gulpjs.com/)** – Task runner for automating the build process
- **[Sass (Dart)](https://sass-lang.com/)** – CSS preprocessor for structured styling
- **[PostCSS](https://postcss.org/)** – Tool for transforming CSS with JavaScript
  - **[Autoprefixer](https://github.com/postcss/autoprefixer)** – Adds vendor prefixes automatically
  - **[CSSNano](https://cssnano.co/)** – Minifies and optimizes final CSS
- **[PurgeCSS](https://purgecss.com/)** – Removes unused CSS for smaller file sizes
- **[Babel](https://babeljs.io/)** – Transpiles modern JavaScript to browser-compatible code
- **[BrowserSync](https://browsersync.io/)** – Live-reloading and syncing across devices
- **[gulp-imagemin](https://github.com/sindresorhus/gulp-imagemin)** – Optimizes image assets
- **[gulp-webp](https://github.com/sindresorhus/gulp-webp)** – Converts images to WebP format
- **[gulp-sourcemaps](https://github.com/gulp-sourcemaps/gulp-sourcemaps)** – Generates source maps for debugging
- **[gulp-notify](https://github.com/mikaelbr/gulp-notify)** – Desktop notifications for build errors

---

## 📁 File Structure

```
├── app/
│   ├── images/             # Source images
│   ├── js/                 # Main JS + vendors
│   │   ├── main.js
│   │   └── vendors/
│   ├── scss/               # SCSS (modular structure)
│   │   ├── abstracts/
│   │   ├── base/
│   │   ├── pages/
│   │   └── main.scss
│   ├── fonts/
│   └── index.html
│
└── build/                  # Output directory
    ├── assets/
    │   ├── css/
    │   │   └── styles.min.css
    │   ├── js/
    │   │   ├── app.min.js
    │   │   └── vendors.min.js
    │   ├── images/
    │   └── fonts/
    └── index.html
```
