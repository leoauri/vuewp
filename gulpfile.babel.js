(() => {
  /*
  |-----------------------------------------------------------------------------
  | Load Environment Variables
  |-----------------------------------------------------------------------------
  */
  require('dotenv').config();

  /*
  |-----------------------------------------------------------------------------
  | Load Modules
  |-----------------------------------------------------------------------------
  */

  const gulp = require('gulp');

  // BrowserSync
  const browserSync = require('browser-sync').create();

  // JS Related
  // uglify = require('gulp-uglify');
  const webpack = require('webpack-stream');

  /*
  |-----------------------------------------------------------------------------
  | Global Config
  |-----------------------------------------------------------------------------
  */

  const themePath = './wp-content/themes/vuewp';

  const otherPaths = {
    distPath: `${themePath}/dist`,
    webpackConfig: './webpack.config.js',
    webpackProdConfig: './webpack.prod.config.js',
    webpackPrerenderConfig: './webpack.prerender.config.js',
  };

  /*
  |-----------------------------------------------------------------------------
  | BrowserSync Webserver
  |-----------------------------------------------------------------------------
  */

  /* Use this to serve static site i.e. decoupled from WP
   * Entrypoint: dist/index.html
   */
  gulp.task('browser-sync', ['webpack'], () => {
    browserSync.init({
      server: {
        baseDir: `${themePath}/dist`,
      },
      port: 8080,
      open: true,
      browser: process.env.DEV_BROWSER,
      notify: false,
    });
  });

  /*
  |-----------------------------------------------------------------------------
  | Webpack
  |-----------------------------------------------------------------------------
  */
  gulp.task('webpack:build', () => {
    // Prod webpack task
    webpack(require(otherPaths.webpackProdConfig)).pipe(gulp.dest(`${otherPaths.distPath}/js`));
  });

  // Prod webpack task webpack task but without index.html generation but with prerendering
  gulp.task('webpack:prerender', () => {
    webpack(require(otherPaths.webpackPrerenderConfig)).pipe(
      gulp.dest(`${otherPaths.distPath}/js`),
    );
  });

  gulp.task('webpack', (cb) => {
    const config = require(otherPaths.webpackConfig);
    config.watch = true;

    // The callback lets gulp know Webpack is finished building, so task 'browser-sync' can be dependent on it
    // Webpack calls back each time it rebuilds, but gulp throws an error after the first call
    // Anyway we only need the first, so test and only call once
    var hasfired;

    webpack(config, null,
      (err) => {
        if (!hasfired) {
          cb(err);
          hasfired = true;
        }
      })
    .pipe(gulp.dest(`${otherPaths.distPath}/js`));

  });

  /*
  |-----------------------------------------------------------------------------
  | Gulp Tasks
  |-----------------------------------------------------------------------------
  */

  /** Build Task */

  gulp.task('default', ['webpack:build', 'webpack:prerender']);

  /** Server Task */
  gulp.task('serve', ['webpack', 'browser-sync'], () => {
    // Watch HTML
    gulp.watch(`${otherPaths.distPath}/index.html`, browserSync.reload);

    // Watch JS Scripts
    gulp.watch(`${otherPaths.distPath}/**/*.js`, browserSync.reload);
  });
})();
