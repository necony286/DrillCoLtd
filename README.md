# DRILLCOLTD Website

A modern, responsive website for DRILL WEED SHOP, built with a Gulp.js asset pipeline, Sass, and modern JavaScript. The site uses a static background image and a modular, maintainable codebase.

---

## 🚀 Getting Started

### 📦 Installation

```bash
npm install
```

Installs all required development dependencies.

> **Note**: Development expects **Node.js 20.19.4**. An `.nvmrc` file is provided for use with [nvm](https://github.com/nvm-sh/nvm) or a similar manager.

### 📌 Node Version via nvm

If you have [nvm](https://github.com/nvm-sh/nvm) installed, run the following commands before starting development. They ensure you are using Node **20.19.4** as defined in `.nvmrc`:

```bash
nvm install 20.19.4
nvm use 20.19.4
```

---

### 🧪 Development

```bash
npm start
# or
npx gulp watch
```

Starts the development server with:

- SCSS compilation
- Image optimization
- Live reload via BrowserSync

Clean the `/build` directory:

```bash
npm run clean
```

### 🧹 Linting

Run the linters to check your source files:

```bash
npm run lint:js
npm run lint:scss
```

`npm run lint:js` executes **ESLint** on the project's JavaScript, while `npm run lint:scss` runs **Stylelint** against all SCSS files.

---

### 🏗️ Building for Production

```bash
npm run build
# or
npx gulp
```

Outputs an optimized, cache-busted build in the `/build` folder:

- Minified CSS/JS
- Purged unused styles with **PurgeCSS**
- Optimized images (JPEG/PNG/WebP)
- Final HTML with cache-busting
- Asset links in `app/index.html` and `app/contact.html` include a `?cb=0`
  placeholder that Gulp replaces with a timestamp during the build to ensure
  browsers fetch the latest files.

---

### 🚀 Deployment

The production-ready, static files are located in the `/build` directory. This folder can be deployed to any static web host.

#### Automated Deployment

This repository is configured for continuous deployment using GitHub Actions. When changes are pushed to the `main` branch, the following automated process is triggered, as defined in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

1.  **Checkout & Setup**: The repository code is checked out, and the correct Node.js version is set up.
2.  **Install & Build**: Dependencies are installed (`npm install`), and the project is built for production (`npx gulp`).
3.  **Deploy**: The contents of the `build/` directory are securely copied to the production server using SCP.

This ensures that the live website is always up-to-date with the latest changes in the `main` branch.

---

### 🔧 Gulp Task Reference

| Command        | Description                                      |
| -------------- | ------------------------------------------------ |
| `gulp`         | Clean + build everything                         |
| `gulp watch`   | Start dev server with live reload                |
| `gulp clean`   | Delete the `/build` folder                       |
| `gulp styles`  | Compile SCSS and remove unused CSS with PurgeCSS |
| `gulp scripts` | Transpile and bundle JS                          |
| `gulp images`  | Optimize images                                  |
| `gulp favicon` | Copy favicon                                     |
| `gulp videos`  | Copy videos to the build directory               |

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
- **[imagemin-webp](https://github.com/imagemin/imagemin-webp)** – Converts images to WebP format
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
│   ├── videos/             # Background videos
│   ├── index.html
│   └── contact.html
│
└── build/                  # Output directory
    ├── assets/
    │   ├── css/
    │   │   └── styles.min.css
    │   ├── js/
    │   │   ├── app.min.js
    │   │   └── vendors.min.js
    │   ├── images/
    │   ├── videos/
    │   └── fonts/
    ├── index.html
    └── contact.html
```

---

## 🌐 Network Troubleshooting

When operating behind a proxy, configure npm or environment variables so it can reach external registries.

```bash
export HTTP_PROXY=http://your.proxy:8080
export HTTPS_PROXY=http://your.proxy:8080
# or
npm config set proxy http://your.proxy:8080
npm config set https-proxy http://your.proxy:8080
```

If network access is restricted, `npm install` may fail with `ECONNRESET`.

---

## 📜 License

This project is proprietary. All rights reserved. See the [LICENSE](LICENSE) file for details.
