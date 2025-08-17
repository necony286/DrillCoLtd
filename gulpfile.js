const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const sourcemaps = require("gulp-sourcemaps");
const babel = require("gulp-babel");
const concat = require("gulp-concat");
const terser = require("gulp-terser");
const rename = require("gulp-rename");
const browserSync = require("browser-sync").create();
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const purgecss = require("@fullhuman/postcss-purgecss").default;
const replace = require("gulp-replace");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify").withReporter((options, callback) => {
  if (process.env.CI) return callback();
  require("gulp-notify")(options, callback);
});
const htmlmin = require("gulp-htmlmin");
const fs = require("fs");
const path = require("path");
const { globSync } = require("glob");

const paths = {
  html: { src: "./app/**/*.html", dest: "./build" },
  styles: { src: "./app/scss/main.scss", dest: "./build/assets/css" },
  scripts: { src: "./app/js/*.js", dest: "./build/assets/js" },
  vendors: { src: "./app/js/vendors/**/*.js", dest: "./build/assets/js" },
  images: { src: "./app/images/**/*", dest: "./build/assets/images" },
  videos: { src: "./app/videos/**/*", dest: "./build/assets/videos" },
  fonts: {
    src: "./app/fonts/**/*.{woff,woff2,ttf,eot,otf}",
    dest: "./build/assets/fonts",
  },
  favicon: { src: "./app/favicon.ico", dest: "./build" },
};

const errorHandler = function (err) {
  const message = err?.message || "Unknown Gulp Error";
  notify.onError({ title: "❌ Gulp Error", message, sound: false })(err);
  console.error("❌ Gulp Error:", message);
  this.emit("end");
};

const clean = async () => {
  const { deleteAsync } = await import("del");
  return deleteAsync(["./build"]);
};

const cacheBust = () => {
  const curTime = new Date().getTime();
  return gulp
    .src("./build/**/*.html")
    .pipe(plumber({ errorHandler }))
    .pipe(replace(/cb=\d+/g, "cb=" + curTime))
    .pipe(gulp.dest("./build"));
};

const html = () =>
  gulp
    .src(paths.html.src)
    .pipe(plumber({ errorHandler }))
    .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
    .pipe(gulp.dest(paths.html.dest));

const styles = () =>
  gulp
    .src("./app/scss/main.scss") // Only main.scss!
    .pipe(plumber({ errorHandler }))
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(
      postcss([
        purgecss({
          content: ["./app/**/*.html", "./app/js/**/*.js"],
          safelist: [/^splide/, /^is-/],
        }),
        autoprefixer(),
        cssnano(),
      ])
    )
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

const images = async (done) => {
  const imagemin = (await import("imagemin")).default;
  const imageminMozjpeg = (await import("imagemin-mozjpeg")).default;
  const imageminOptipng = (await import("imagemin-optipng")).default;
  const imageminSvgo = (await import("imagemin-svgo")).default;

  const files = await imagemin([paths.images.src], {
    destination: paths.images.dest,
    plugins: [
      imageminMozjpeg({ quality: 80 }),
      imageminOptipng({ optimizationLevel: 5 }),
      imageminSvgo({
        plugins: [{ name: "removeViewBox", active: false }],
      }),
    ],
  });
  console.log(`Processed ${files.length} images.`);
  done();
};

const webpImages = async (done) => {
  const imagemin = (await import("imagemin")).default;
  const imageminWebp = (await import("imagemin-webp")).default;

  const files = await imagemin([paths.images.src], {
    destination: paths.images.dest,
    plugins: [imageminWebp({ quality: 80 })],
  });
  console.log(`Converted ${files.length} images to WebP.`);
  done();
};

const createCopyTask = (taskName, pathsConfig) => (done) => {
  const sourceFiles = globSync(pathsConfig.src);
  if (sourceFiles.length === 0) {
    return done();
  }
  const destDir = pathsConfig.dest;
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  sourceFiles.forEach((file) => {
    const destPath = path.join(destDir, path.basename(file));
    fs.copyFileSync(file, destPath);
  });
  console.log(`Copied ${sourceFiles.length} ${taskName}.`);
  done();
};

const videos = createCopyTask("videos", paths.videos);
const fonts = createCopyTask("fonts", paths.fonts);

const favicon = () =>
  gulp.src(paths.favicon.src).pipe(gulp.dest(paths.favicon.dest));

const reload = (done) => {
  browserSync.reload();
  done();
};

function watchFiles() {
  browserSync.init({
    server: { baseDir: "./build" },
    notify: false,
  });

  gulp.watch("./app/scss/**/*.scss", styles);

  gulp.watch(paths.vendors.src, gulp.series(vendors, reload));
  gulp.watch(paths.favicon.src, gulp.series(favicon, reload));
  gulp.watch(paths.scripts.src, gulp.series(scripts, reload));
  gulp.watch(paths.images.src, gulp.series(images, webpImages, reload));
  gulp.watch(paths.videos.src, gulp.series(videos, reload));
  gulp.watch(paths.fonts.src, gulp.series(fonts, reload));
  gulp.watch(paths.html.src, gulp.series(html, cacheBust, reload));
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
    videos,
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
exports.videos = videos;
exports.fonts = fonts;
exports.favicon = favicon;
exports.html = html;
exports.cacheBust = cacheBust;
exports.watch = watch;
exports.build = build;
exports.default = build;
