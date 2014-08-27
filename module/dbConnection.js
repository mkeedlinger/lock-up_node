var thinky = require('thinky');

module.exports = function (options) {
    return thinky({
        db: options.db,
        host: 'localhost',
        authKey: options.authKey,
        port: options.port,
        min: options.min || 10,
        max: options.max || 500,
        bufferSize: options.bufferSize || 10,
        timeoutError: options.timeoutError || 1000,
        timeoutGb: options.timeoutGb || 60*1000
    });
}