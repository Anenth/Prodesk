import argv         from 'yargs';
import autoprefixer from 'autoprefixer';
import Browsersync  from 'browser-sync';
import cp           from 'child_process';
import eslint       from 'gulp-eslint';
import gulp         from 'gulp';
import imagemin     from 'gulp-imagemin';
import sourcemaps   from 'gulp-sourcemaps';
import named        from 'vinyl-named';
import newer        from 'gulp-newer';
import plumber      from 'gulp-plumber';
import pngquant     from 'imagemin-pngquant';
import postcss      from 'gulp-postcss';
import sass         from 'gulp-sass';
import uglify       from 'gulp-uglify';
import watch        from 'gulp-watch';
// var webpack      = require('webpack-stream');
const browsersync = Browsersync.create();

import webpack from 'webpack';
import webpackConfig from './webpack.config.babel';
import WebpackDevServer from 'webpack-dev-server';
import gutil from 'gulp-util';
import critical from 'critical';

var jekyll = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';

// Load configurations & set variables
var config = require('./config.js');
var tasks  = [];
var build  = [];
var paths  = {};
var entry  = [];

/**
 * Set default & build tasks
 */
Object.keys(config.tasks).forEach(function (key) {
  if (config.tasks[key]) {
    tasks.push(key == 'webpack' ? '_' + key : key);
  }
});

Object.keys(config.tasks).forEach(function (key) {
  if (config.tasks[key] && key != 'server') {
    build.push(key);
  }
});

/**
 * Paths
 */
Object.keys(config.paths).forEach(function (key) {
  if (key != 'assets') {
    if (config.paths.assets === '') {
      paths[key] = './' + config.paths[key];
    } else {
      paths[key] = config.paths.assets + '/' + config.paths[key];
    }
  }
});

for (var i = 0; i <= config.js.entry.length - 1; i++) {
  entry.push(paths.jsSrc + '/' + config.js.entry[i]);
}

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
  var jekyllConfig = config.jekyll.config.default;
  console.log(argv.production);
  if (argv.production) {
    process.env.JEKYLL_ENV = 'production';
    jekyllConfig += config.jekyll.config.production ? ',' + config.jekyll.config.production : '';
  } else {
    jekyllConfig += config.jekyll.config.development ? ',' + config.jekyll.config.development : '';
  }
  return cp.spawn(jekyll, ['build', '--config', jekyllConfig], {stdio: 'inherit', env: process.env})
    .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
  browsersync.notify('Rebuilded Jekyll');
  browsersync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('server', ['jekyll-build'], function() {
  return browsersync.init({
    port: config.port,
    server: {
      baseDir: config.paths.dest,
    }
  });
});

/**
 * Sass
 */
gulp.task('sass', function () {
  return gulp.src(paths.sass + '/**/*')
    .pipe(sourcemaps.init()) // Initializes sourcemaps
    .pipe(sass({outputStyle: config.sass.outputStyle}).on('error', sass.logError))
    .pipe(postcss([
      autoprefixer({
        browsers: config.autoprefixer.browsers
      })
    ]))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.css));
});

/**
 * imagemin
 */
gulp.task('imagemin', function () {
  return gulp.src(paths.imagesSrc + '/**/*')
    .pipe(plumber())
    .pipe(newer(paths.images))
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest(paths.images));
});

/**
 * eslint
 */
gulp.task('eslint', function() {
  return gulp.src(entry)
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failOnError());
});

/**
 * Webpack
 *
 * Bundle JavaScript files
 */
gulp.task('webpack', ['eslint'], function (callback) {
  var myConfig = Object.create(webpackConfig);
  myConfig.plugins = [
		new webpack.optimize.UglifyJsPlugin()
  ];

  // run webpack
  webpack(myConfig, function(err, stats) {
    if (err) throw new gutil.PluginError('webpack', err);
    gutil.log('[webpack]', stats.toString({
      colors: true,
      progress: true
    }));
    callback();
  });
});

gulp.task('server-webpack', ['webpack'], function() {

	const server = new WebpackDevServer(webpack(webpackConfig), {
		// publicPath: '/' + myConfig.output.publicPath,
		stats: {
			colors: true
		},
		hot: true
  });
  server.listen(8080, 'localhost', function(err) {
		if(err) throw new gutil.PluginError('webpack-dev-server', err);
	});
});

// For internal use only
gulp.task('_webpack', function () {
  argv.watch = true;
  gulp.start('server-webpack');
});

/**
 * Build
 */
gulp.task('build', [...build, 'jekyll-build'], function (done) {
  gulp.start('critical');
});

/**
 * Default task, running just `gulp` will minify the images, compile the sass, js, and jekyll site,
 * launch BrowserSync, and watch files. Tasks can be configured by frascoconfig.json.
 */
gulp.task('default', tasks, function () {
  if (config.tasks.imagemin) {
    watch(paths.imagesSrc + '/**/*', function () {
      gulp.start('imagemin');
    });
  }

  if (config.tasks.sass) {
    watch(paths.sass + '/**/*', function () {
      gulp.start('sass');
    });
  }

  if (config.tasks['server']) {
    watch([
      '!./node_modules/**/*',
      '!./README.md',
      '!' + paths.dest + '/**/*',
      '_includes/**/*',
      '_layouts/**/*',
      '*.html',
      './**/*.md',
      './**/*.markdown',
      paths.posts + '/**/*',
      paths.css + '/**/*',
      paths.js + '/**/*',
      paths.images + '/**/*'
    ], function () {
      gulp.start('jekyll-rebuild');
    });
  }
});

/**
 * Test
 */
gulp.task('test', ['build']);


gulp.task('critical', function () {
    critical.generate({
        base: './',
        src: '_site/index.html',
        css: '_site/assets/css/main.css',
        dest: config.paths.criticalCss,
        width: 1200,
        height: 800,
        minify: true
    });
});