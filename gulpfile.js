var // Core
    gulp = require('gulp'), // The main gulp module
    nodemon = require('gulp-nodemon'),
    notify = require('gulp-notify'),
    bump = require('gulp-bump'),
    config = require('./config');

gulp.task('default', function() {
    nodemon({
        script: 'index.js',
        ext: 'js',
        ignore: ['gulpfile.js']
    });
});

gulp.task('bump', function () {
    gulp.src('./package.json')
    .pipe(bump({type:'patch'}))
    .pipe(gulp.dest('./'));
});