// depends
var colors = require('colors');

module.exports = {
    port: process.env.PORT || 3000,
    root: __dirname,
    prod: !!process.env.PROD || false,
    sendgrid: {
        user: 'christiansenfasteners',
        pass: 'eakentuituel'
    }
}
def = module.exports;

console.l = function () {
    if (!def.prod) {
        return function () {
            var logs = Array.prototype.slice.call(arguments),
                logTag = '[debug] ',
                logMessage = [logTag['yellow'] + logs[0]].concat(logs.slice(1));
            console.log.apply(console, logMessage);
        }
    } else {
        return function () {}
    }
}();
console.ll = function () {
    var logs = Array.prototype.slice.call(arguments),
        logTag = '[lock-up] ',
        logMessage = [logTag['green'] + logs[0]].concat(logs.slice(1));
    console.log.apply(console, logMessage);
}