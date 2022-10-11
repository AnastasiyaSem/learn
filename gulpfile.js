"use strict";

const gulp = require("gulp");
const sass = require('gulp-sass')(require('sass'));
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require("gulp-csso");
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const svgstore = require("gulp-svgstore");
const posthtml = require("gulp-posthtml");
const include = require("posthtml-include");
const del = require("del");
const server = require("browser-sync").create();
const babel = require('gulp-babel');
const babelify = require('babelify');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const es = require('event-stream');

gulp.task("css", () => {
  return gulp.src("source/sass/style.scss")
    // .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});


gulp.task("js-compress", () => {
  return browserify({
    entries: [
      "source/js/app.js"
    ]
  })
    .transform(babelify.configure({
      presets : ["@babel/preset-env", "@babel/preset-react"]
    }))
    .bundle()
    .pipe(source("script.min.js"))
    .pipe(buffer())
    .pipe(gulp.dest("build/js"));

});

gulp.task("images",  () => {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({
        optimizationLevel: 3
      }),
      imagemin.jpegtran({
        progressive: true
      }),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("source/img"));
});

gulp.task("sprite",  () => {
  return gulp.src("source/img/icon-sv-*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("html",  () => {
  return gulp.src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("build"));
});


gulp.task("clean",  () => {
  return del("build");
});

gulp.task("copy",  () => {
  return gulp.src([
    "source/fonts/**/*",
    "source/img/**"

  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"));
});

gulp.task("server", () => {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/sass/**/*.{scss,sass}", gulp.series("css"));
  gulp.watch("source/img/icon-s-*.svg", gulp.series("sprite", "html", "refresh"));
  gulp.watch("source/js/*.js", gulp.series("js-compress", "refresh"));
  gulp.watch("source/js/*.js").on("change", server.reload);
  gulp.watch("source/*.html", gulp.series("html", "refresh"));
  gulp.watch("source/*.html").on("change", server.reload);
});

gulp.task("refresh",  (done) => {
  server.reload();
  done();
});
gulp.task("build", gulp.series("clean", "copy", "css", "sprite", "js-compress" ,"html"));
gulp.task("start", gulp.series("build", "server"));