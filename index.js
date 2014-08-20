// depends
var // db
    thinky = require('thinky'),
    r = thinky.r,

    // http
    express = require('express'),
    req = require('request'),

    // helpers
    val = require('validator'),
    schema = require('validate-obj'),
    config = require('./config');

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
var serverSchema = {
    port: schema.isNumber,
    apiAuth: [{
        username: schema.isAlphanumeric([5]), password: schema.minLength([10])
    }],
    db: {
        port: schema.isNumber,
        db: schema.isAlphanumeric,
        authKey: schema.isString,
        min: schema.isNumber,
        max: schema.isNumber,
        bufferSize: schema.isNumber,
        timeoutError: 1000,
        timeoutGb: 60*1000
    },
    cluster: schema.isBool,
    https: {
        privateKey: schema.isString,
        certificate: schema.isString
    },
    oauth: {
        open: schema.isBool,
        maxKeyPerAccount: schema.isNumber
    }
};
var pluginSchema = {
    db: {
        db: schema.isAlphanumeric,
        port: schema.isNumber,
        authKey: schema.isString,
        min: schema.isNumber,
        max: schema.isNumber,
        bufferSize: schema.isNumber,
        timeoutError: 1000,
        timeoutGb: 60*1000
    }
}
////
//export
////
var def = {};
def.client = function (options) {
    schema.hasErrors(options, clientSchema);
}

def.server = function (options) {
    //
}

def.plugin = function (options) {
    // check options..
    var optionErrors;
    if (options.hasOwnProperty('alsoServer')) {
        optionErrors = schema.hasErrors(options.alsoServer, serverSchema);
        if (optionErrors) {
            throw optionErrors;
        }
    }
    optionErrors = schema.hasErrors(options, pluginSchema);
    if (optionErrors) {
        throw optionErrors;
    }

    ////
    // meat
    ////
    var plugin = {}
    plugin.db = thinky({
        db: options.alsoServer.db.db || options.db.db,
        host: 'localhost',
        authKey: options.alsoServer.db.authKey || options.db.authKey,
        port: options.alsoServer.db.port || options.db.port,
        min: options.alsoServer.db.min || options.db.min,
        max: options.alsoServer.db.max || options.db.max,
        bufferSize: options.alsoServer.db.bufferSize || options.db.bufferSize,
        timeoutError: options.alsoServer.db.timeoutError || options.db.timeoutError,
        timeoutGb: options.alsoServer.db.timeoutGb || options.db.timeoutGb
    });
}