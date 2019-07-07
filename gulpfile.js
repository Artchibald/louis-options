"use strict";

// Load plugins
//sudo npm install --save-dev  --unsafe-perm node-sass
// sudo npm install -g optipng autoprefixer browsersync child_process cssnano del gulp-eslint gulp gulp-imagemin gulp-newer gulp-postcss gulp-rename gulp plumber gulp-postcss gulp-rename gulp-sass webpack webpack-stream gulp-sass --unsafe-perm=true --allow-root
const autoprefixer = require("autoprefixer");
const browsersync = require("browser-sync").create();
const cp = require("child_process");
const cssnano = require("cssnano");
const del = require("del");
const eslint = require("gulp-eslint");
const gulp = require("gulp");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const concat = require('gulp-concat');
//const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const webpack = require("webpack");
const webpackconfig = require("./webpack.config.js");
const webpackstream = require("webpack-stream");
const kit = require('gulp-kit');

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./dist/"
    },
    port: 3000
  });
  done();
}

// BrowserSync Reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Clean assets
function clean() {
  return del(["./dist/"]);
}

// Optimize Images
function images() {
  return gulp
    .src("./src/assets/images/**/*")
    .pipe(newer("./dist/assets/images"))
    .pipe(
      imagemin([
        //imagemin.gifsicle({ interlaced: true }),
        //imagemin.jpegtran({ progressive: true }),
        //imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true
            }
          ]
        })
      ])
    )
    .pipe(gulp.dest("./dist/assets/images"));
}

// CSS task
function css() {
  return gulp
    .src("./src/assets/scss/**/*.scss")
    //.pipe(plumber())
    .pipe(sass({ errLogToConsole: true, outputStyle: "compressed" }))
    //.pipe(sass({ outputStyle: "compressed" }))
    .pipe(gulp.dest("./dist/assets/css/"))
    //.pipe(rename({ basename: "main.js" }))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(concat('style.css'))
    .pipe(gulp.dest("./dist/assets/css/"))
    .pipe(browsersync.stream());
}
// CSS task
function htmlMove() {
  return gulp
    .src("./src/*.html")
    //.pipe(plumber())
    //.pipe(sass({ outputStyle: "expanded" }))
    //.pipe(gulp.dest("./dist/assets/css/"))
    //.pipe(rename({ basename: "main.js" }))
    //.pipe(postcss([autoprefixer(), cssnano()]))
    //.pipe(concat('style.css'))
    .pipe(gulp.dest("./dist/"))
    .pipe(browsersync.stream());
}
function kitMove() {
  return gulp.src('src/*.kit')
    .pipe(kit())
    .pipe(gulp.dest('dist/'));
}

// Lint scripts
function scriptsLint() {
  return gulp
    .src(["./src/assets/js/**/*", "./gulpfile.js"])
    //.pipe(plumber())
    //.pipe(eslint())
    //.pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

// Transpile, concatenate and minify scripts
function scripts() {
  return (
    gulp
      .src(["./src/assets/js/**/*"])
      .pipe(concat('main.js'))
      .pipe(rename({ basename: "main" }))
      //.pipe(plumber())
      //.pipe(webpackstream(webpackconfig, webpack))
      // folder only, filename is specified in webpack config
      .pipe(gulp.dest("./dist/assets/js/"))
      .pipe(browsersync.stream())
  );
}



// Watch files
function watchFiles() {

  gulp.watch("./src/assets/scss/**/*", css);
  gulp.watch("./src/**/*", htmlMove, kitMove);
  gulp.watch("./src/assets/js/**/*", gulp.series(scriptsLint, scripts));
  gulp.watch(
    [
      "./**/*"
    ],
    gulp.series(browserSyncReload)
  );
  gulp.watch("./src/assets/images/**/*", images);
}

// define complex tasks
const js = gulp.series(scriptsLint, scripts, htmlMove, kitMove);
const build = gulp.series(clean, gulp.parallel(css, images, js, htmlMove, kitMove));
const watch = gulp.parallel(watchFiles, browserSync);

// export tasks
exports.images = images;
exports.css = css;
exports.htmlMove = htmlMove;
exports.kitMove = kitMove;
exports.js = js;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = build;
