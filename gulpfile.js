const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();

const paths = {
  scss: './src/scss/**/*.scss',
  css: './dist/css/',
  html: './*.html',
  js: './*.js'
};

function compileSCSS() {
  return gulp.src(paths.scss)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest(paths.css))
    .pipe(browserSync.stream());
}

function watchFiles() {
  browserSync.init({
    server: {
      baseDir: './'
    }
  });
  gulp.watch(paths.scss, compileSCSS);
  gulp.watch([paths.html, paths.js]).on('change', browserSync.reload);
}

exports.default = gulp.series(compileSCSS, watchFiles);
