var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var cleancss = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var gulp_changed = require('gulp-changed');
var browserSync = require('browser-sync').create();

var css_path = "./styles/*.css";
var css_dest_path = "./styles/dest";
var js_path = "./js/*.js";
var js_dest_path = './js/dest/';

// Static server
gulp.task('serve', function() {
    browserSync.init({
        server: "./",
        files: [
            css_dest_path + '/*.js',
            js_dest_path + '/*.js'
        ]
    });

    gulp.watch(js_path, ['js', 'reload']);
    gulp.watch(css_path, ['css', 'reload']);
    gulp.watch('**/*.htm?', ['reload']);
});

gulp.task('css', function() {
    gulp.src(css_path)
        .pipe(gulp_changed(css_dest_path))
        .pipe(cleancss({compatibility: 'ie8'}))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(css_dest_path))
});

gulp.task('js', function() {
    gulp.src(js_path)
        .pipe(gulp_changed(js_dest_path))
        .pipe(sourcemaps.init())
        .pipe(jshint())
        .pipe(uglify().on('error', function(err) {
            console.log(err)
        }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(js_dest_path))
});

gulp.task('reload', function() {
    browserSync.reload();
});

gulp.task('default', ['css', 'js', 'serve']);
