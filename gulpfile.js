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
const fileinclude = require("gulp-file-include");
const fs = require("fs");
const path = require("path");
const { globSync } = require("glob");

const paths = {
  html: { src: "./app/*.html", watch: "./app/**/*.html", dest: "./build" },
  styles: { src: "./app/scss/main.scss", dest: "./build/assets/css" },
  vendorStyles: {
    src: "./node_modules/@splidejs/splide/dist/css/splide.min.css",
    dest: "./build/assets/css",
  },
  scripts: {
    src: ["./app/js/*.js", "!./app/js/gtag.js"],
    dest: "./build/assets/js",
  },
  analytics: { src: "./app/js/gtag.js", dest: "./build/assets/js" },
  vendors: {
    src: [
      "./node_modules/@splidejs/splide/dist/js/splide.min.js",
      "./app/js/vendors/**/*.js",
    ],
    dest: "./build/assets/js",
  },
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
    .pipe(fileinclude({ basepath: "@file" }))
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
          safelist: [
            /^splide/,
            /^is-/,
            "age-modal",
            "age-modal__dialog",
            "age-modal__btn",
            "age-modal__actions",
          ],
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

const analytics = () =>
  gulp
    .src(paths.analytics.src)
    .pipe(plumber({ errorHandler }))
    .pipe(babel({ presets: ["@babel/preset-env"] }))
    .pipe(terser())
    .pipe(rename({ basename: "gtag", suffix: ".min" }))
    .pipe(gulp.dest(paths.analytics.dest));

const vendors = () =>
  gulp
    .src(paths.vendors.src)
    .pipe(plumber({ errorHandler }))
    .pipe(concat("vendors.min.js"))
    .pipe(gulp.dest(paths.vendors.dest));

const images = async (done) => {
  const imagemin = (await import("imagemin")).default;
  const imageminMozjpeg = (await import("imagemin-mozjpeg")).default;
  const imageminOptipng = (await import("imagemin-optipng")).default;
  const imageminSvgo = (await import("imagemin-svgo")).default;
  const { glob } = await import("glob");

  const files = await glob(paths.images.src, { nodir: true });

  await Promise.all(
    files.map(async (file) => {
      const buffer = await imagemin([file], {
        plugins: [
          imageminMozjpeg({ quality: 80 }),
          imageminOptipng({ optimizationLevel: 5 }),
          imageminSvgo({
            plugins: [
              {
                name: "preset-default",
                params: {
                  overrides: {
                    removeViewBox: false,
                    removeUnknownsAndDefaults: false,
                    cleanupIds: false,
                  },
                },
              },
            ],
          }),
        ],
      });
      if (!buffer.length) return;

      const rel = path.relative(
        path.join(process.cwd(), "app", "images"),
        file
      );
      const outDir = path.join(paths.images.dest, path.dirname(rel));
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

      const outFile = path.join(outDir, path.basename(rel));
      fs.writeFileSync(outFile, buffer[0].data);
    })
  );
  console.log(`Processed ${files.length} images (structure preserved).`);
  done();
};

const webpImages = async (done) => {
  const imagemin = (await import("imagemin")).default;
  const imageminWebp = (await import("imagemin-webp")).default;
  const { glob } = await import("glob");

  const files = await glob(paths.images.src, { nodir: true });

  await Promise.all(
    files
      .filter((f) => /\.(jpe?g|png)$/i.test(f))
      .map(async (file) => {
        const buffer = await imagemin([file], {
          plugins: [imageminWebp({ quality: 80 })],
        });
        if (!buffer.length) return;

        const rel = path.relative(
          path.join(process.cwd(), "app", "images"),
          file
        );
        const outDir = path.join(paths.images.dest, path.dirname(rel));
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

        const base = path.basename(rel).replace(/\.(jpe?g|png)$/i, ".webp");
        const outFile = path.join(outDir, base);
        fs.writeFileSync(outFile, buffer[0].data);
      })
  );
  console.log("Generated WebP images (structure preserved).");
  done();
};

const createCopyTask = (taskName, pathsConfig) => {
  const task = (done) => {
    const sourceFiles = globSync(pathsConfig.src);
    if (sourceFiles.length === 0) return done();

    const destDir = pathsConfig.dest;
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    sourceFiles.forEach((file) => {
      const destPath = path.join(destDir, path.basename(file));
      fs.copyFileSync(file, destPath);
    });
    console.log(`Copied ${sourceFiles.length} ${taskName}.`);
    done();
  };
  task.displayName = taskName; // add a readable name for Gulp logs
  return task;
};

const videos = createCopyTask("videos", paths.videos);
const fonts = createCopyTask("fonts", paths.fonts);
const vendorStyles = createCopyTask("vendor styles", paths.vendorStyles);

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
  gulp.watch(paths.analytics.src, gulp.series(analytics, reload));
  gulp.watch(paths.images.src, gulp.series(images, webpImages, reload));
  gulp.watch(paths.videos.src, gulp.series(videos, reload));
  gulp.watch(paths.fonts.src, gulp.series(fonts, reload));
  gulp.watch(paths.html.watch, gulp.series(html, cacheBust, reload));
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
    vendorStyles,
    styles,
    vendors,
    scripts,
    analytics,
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
exports.analytics = analytics;
exports.vendors = vendors;
exports.images = images;
exports.webpImages = webpImages;
exports.videos = videos;
exports.fonts = fonts;
exports.favicon = favicon;
exports.html = html;
exports.vendorStyles = vendorStyles;
exports.cacheBust = cacheBust;
exports.watch = watch;
exports.build = build;
exports.default = build;
