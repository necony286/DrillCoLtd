const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const babel = require("gulp-babel");
const sourcemaps = require("gulp-sourcemaps");
const concat = require("gulp-concat");
const terser = require("gulp-terser");
const rename = require("gulp-rename");
const browserSync = require("browser-sync").create();
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const replace = require("gulp-replace");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify").withReporter((options, callback) => {
  if (process.env.CI) return callback(); // Skip on GitHub Actions
  require("gulp-notify")(options, callback);
});
const htmlmin = require("gulp-htmlmin");

const fs = require("fs");
const path = require("path");

const paths = {
  html: { src: "./app/**/*.html", dest: "./build" },
  styles: { src: "./app/scss/**/*.scss", dest: "./build/assets/css" },
  scripts: { src: "./app/js/*.js", dest: "./build/assets/js" },
  vendors: { src: "./app/js/vendors/**/*.js", dest: "./build/assets/js" },
  images: { src: "./app/images/**/*", dest: "./build/assets/images" },
  fonts: { src: "./app/fonts/**/*", dest: "./build/assets/fonts" },
  favicon: { src: "./app/favicon.ico", dest: "./build" },
};

// ✅ Helper for error messages
const errorHandler = function (err) {
  const message = err?.message || "Unknown Gulp Error";
  notify.onError({
    title: "❌ Gulp Error",
    message,
    sound: false,
  })(err);
  console.error("❌ Gulp Error:", message);
  this.emit("end");
};

const clean = (done) => {
  const folder = path.resolve(__dirname, "build");
  if (fs.existsSync(folder)) {
    fs.rmSync(folder, { recursive: true, force: true });
  }
  done();
};

const curTime = new Date().getTime();
const cacheBust = () =>
  gulp
    .src(paths.html.src)
    .pipe(plumber({ errorHandler }))
    .pipe(replace(/cb=\d+/g, "cb=" + curTime))
    .pipe(gulp.dest(paths.html.dest));

const html = () =>
  gulp
    .src(paths.html.src)
    .pipe(plumber({ errorHandler }))
    .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
    .pipe(gulp.dest(paths.html.dest));

const styles = () =>
  gulp
    .src(paths.styles.src)
    .pipe(plumber({ errorHandler }))
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(rename({ basename: "styles", suffix: ".min" }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());

const scripts = () =>
  gulp
    .src(paths.scripts.src)
    .pipe(plumber({ errorHandler }))
    .pipe(sourcemaps.init())
    .pipe(babel({ presets: ["@babel/preset-env"] }))
    .pipe(terser())
    .pipe(concat("app.min.js"))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(paths.scripts.dest));

const vendors = () =>
  gulp
    .src(paths.vendors.src)
    .pipe(plumber({ errorHandler }))
    .pipe(sourcemaps.init())
    .pipe(babel({ presets: ["@babel/preset-env"] }))
    .pipe(terser())
    .pipe(concat("vendors.min.js"))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(paths.vendors.dest));

const images = () =>
  gulp
    .src(paths.images.src)
    .pipe(plumber({ errorHandler }))
    .pipe(imagemin())
    .pipe(gulp.dest(paths.images.dest));

const webpImages = () =>
  gulp.src(paths.images.src).pipe(webp()).pipe(gulp.dest(paths.images.dest));

const fonts = () => gulp.src(paths.fonts.src).pipe(gulp.dest(paths.fonts.dest));

const favicon = () =>
  gulp.src(paths.favicon.src).pipe(gulp.dest(paths.favicon.dest));

function watchFiles() {
  browserSync.init({
    server: { baseDir: "./build" },
    notify: false,
  });

  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.vendors.src, vendors).on("change", browserSync.reload);
  gulp.watch(paths.favicon.src, favicon).on("change", browserSync.reload);
  gulp.watch(paths.scripts.src, scripts).on("change", browserSync.reload);
  gulp
    .watch(paths.images.src, gulp.series(images, webpImages))
    .on("change", browserSync.reload);
  gulp.watch(paths.fonts.src, fonts).on("change", browserSync.reload);
  gulp.watch("./app/*.html", html).on("change", browserSync.reload);
}

const finalNotify = (done) => {
  notify({
    title: "✅ Gulp Build",
    message: "All tasks completed successfully!",
    sound: false,
  }).write("");
  done();
};

const build = gulp.series(
  clean,
  gulp.parallel(
    html,
    styles,
    vendors,
    scripts,
    images,
    webpImages,
    fonts,
    favicon
  ),
  cacheBust,
  finalNotify
);

const watch = gulp.series(build, watchFiles);

exports.clean = clean;
exports.styles = styles;
exports.scripts = scripts;
exports.vendors = vendors;
exports.images = images;
exports.webpImages = webpImages;
exports.fonts = fonts;
exports.favicon = favicon;
exports.html = html;
exports.cacheBust = cacheBust;
exports.watch = watch;
exports.build = build;
exports.default = build;
