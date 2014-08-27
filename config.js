// depends
var colors = require('colors');

console.l = function () {
    var logs = Array.prototype.slice.call(arguments),
        logTag = '[debug] ',
        logMessage = [logTag['yellow'] + logs[0]].concat(logs.slice(1));
    console.log.apply(console, logMessage);
}