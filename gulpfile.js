var // Core
    gulp = require('gulp'), // The main gulp module
    notify = require('gulp-notify'),
    bump = require('gulp-bump'),
    config = require('./config');

gulp.task('default', function() {
    console.log('Nothing here.. YET.');
});

gulp.task('bump', function () {
    gulp.src('./package.json')
    .pipe(bump({type:'patch', indent: 4}))
    .pipe(gulp.dest('./'));
});
gulp.task('bumps', function () {
    gulp.src('./package.json')
    .pipe(bump({type:'minor', indent: 4}))
    .pipe(gulp.dest('./'));
});
gulp.task('bumpss', function () {
    gulp.src('./package.json')
    .pipe(bump({type:'major', indent: 4}))
    .pipe(gulp.dest('./'));
});