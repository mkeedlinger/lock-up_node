// depends
var // http
    request = require('request'),
    https = require('https'),

    // validation
    val = require('validator'),
    schema = require('validate-obj'),

    // helpers
    config = require('./config'),
    Promise = require('bluebird');

////
// schema help
////
schema.register('isSecURL', schema.build(
    function (url, par) {
        return val.isURL(url, {protocols:['https'], require_protocol: true});
    }, function (it) {
        return it + " is not a URL (must be HTTPS)";
    }
));
schema.register('isAlphanumeric', schema.build(
    function (leString, par) {
        return val.isAlphanumeric(leString)
        && par ? par.length > par-1 : true
        && typeof leString === 'string';
    }, function (it, params) {
        if (params) {
            return typeof it + " is not an alphanumeric string >= " + params;
        } else {
            return it + " is not an alphanumeric string";
        }
    }
));

var clientSchema = {
    host: schema.isSecURL,
    username: schema.isAlphanumeric([5]),
    password: schema.minLength([10])
};
////
//export
////
var def = function (options) {
    schema.hasErrors(options, clientSchema);
}

module.exports = def;

////
// Custom errors
////
/*
    there seems to be a lot of "right" ways to do this. I decided that I would
    use the way provided by MDN, they seem reliable :)
    http://goo.gl/1qvOzK
*/
function ExistingUserErr(message) {
  this.name = "ExistingUserErr";
  this.message = message || "Existing user with that name";
}
ExistingUserErr.prototype = new Error();
ExistingUserErr.prototype.constructor = ExistingUserErr;

function NonExistingUserErr(message) {
  this.name = "NonExistingUserErr";
  this.message = message || "User did not exist";
}
NonExistingUserErr.prototype = new Error();
NonExistingUserErr.prototype.constructor = NonExistingUserErr;

function BadOptionsErr(message) {
  this.name = "BadOptionsErr";
  this.message = message || "Existing user with that name";
}
BadOptionsErr.prototype = new Error();
BadOptionsErr.prototype.constructor = BadOptionsErr;