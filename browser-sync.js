const bs = require('browser-sync').create();

bs.init({
    server: {
        baseDir: "./public"
    },
    watchOptions: {
        ignoreInitial: true,
        ignored: '*.txt'
    },
    files: ['./public'],
    host: 'localhost',
    port: 7301,

    logPrefix: "webpack",
    logLevel: "info",
    reloadDelay: 1500,
    //tunnel: "webpack",
    serveStatic: ['./public'],
    ui: {
        port: 8080
    },
    ghostMode: false
});
