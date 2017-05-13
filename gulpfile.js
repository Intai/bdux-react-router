/* eslint-env node */

var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    spawn = require('child_process').spawn,
    srcFiles = './src/**/!(*.spec).{js,jsx}',
    testFiles = './src/**/*.spec.{js,jsx}';

gulp.task('clean', function () {
  require('del').sync('lib');
});

gulp.task('cover', function(cb) {
  var cmd = spawn('node', [
    'node_modules/istanbul/lib/cli.js',
    'cover',
    '--root', '.',
    '-x', '**/*.spec.js',
    'node_modules/mocha/bin/_mocha',
    '--', '--opts', '.mocha.opts'
  ], {
    stdio: 'inherit'
  });

  cmd.on('close', cb);
});

gulp.task('test', function(cb) {
  var cmd = spawn('node', [
    'node_modules/mocha/bin/mocha',
    '--opts', '.mocha.opts'
  ], {
    stdio: 'inherit'
  });

  cmd.on('close', cb);
});

gulp.task('lint', function () {
  return gulp.src(srcFiles)
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());
});

gulp.task('babel', function() {
  return gulp.src(srcFiles)
    .pipe($.babel())
    .pipe(gulp.dest('lib'));
});

gulp.task('watch', function() {
  gulp.watch([srcFiles, testFiles], ['test']);
});

gulp.task('build', [
  'clean',
  'babel'
]);

gulp.task('default', [
  'lint',
  'test',
  'watch'
]);
