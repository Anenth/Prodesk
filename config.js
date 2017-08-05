module.exports = {
  port: 4000,

  tasks: {
    imagemin:   true,
    sass:       true,
    server:     true,
    webpack:    true,
    critical:    true
  },

  paths: {
    dest:      "_site",
    posts:     "_posts",
    assets:    "./assets",
    css:       "css",
    criticalCss: "_includes/critical.css",
    js:        "js",
    images:    "images",
    sass:      "_sass",
    jsSrc:     "_js",
    imagesSrc: "_images",
  },

  jekyll: {
    config: {
      default:     "_config.yml",
      development: "_config_development.yml",
      production:  "",
    }
  },

  sass: {
    outputStyle: "compressed",
  },

  autoprefixer: {
    browsers: [
      "> 1%",
      "last 2 versions",
      "Firefox ESR",
    ]
  },

  js: {
    entry: ["app.js"],
  },
}
