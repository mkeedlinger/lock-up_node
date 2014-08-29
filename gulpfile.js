var // Core
    gulp = require('gulp'), // The main gulp module
    notify = require('gulp-notify'),
    bump = require('gulp-bump')
    nodemon = require('gulp-nodemon');

gulp.task('default', function() {
    nodemon({
        script: 'test.js',
        ext: 'js',
        ignore: ['node_modules/']
    });
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