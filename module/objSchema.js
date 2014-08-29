var schema = require('validate-obj'),
    val = require('validator');

schema.register('isAlphanumeric', schema.build(
    function (leString, par) {
        return val.isAlphanumeric(leString)
        && par ? leString.length >= par : true
        && typeof leString === 'string';
    }, function (it, params) {
        if (params) {
            return it + " is not an alphanumeric string >= " + params;
        } else {
            return it + " is not an alphanumeric string";
        }
    }
));

var dbSchema = {
    port: schema.isNumber,
    db: schema.isAlphanumeric,
    authKey: schema.isString,
    min: schema.isNumber,
    max: schema.isNumber,
    bufferSize: schema.isNumber,
    timeoutError: schema.isNumber,
    timeoutGb: schema.isNumber
}
module.exports.serverSchema = {
    port: schema.isNumber,
    apiAuth: [{
        username: schema.isAlphanumeric([5]), password: schema.minLength([10])
    }],
    db: dbSchema,
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
module.exports.pluginSchema = {
    db: dbSchema
}
module.exports.clientSchema = {
    port: schema.isNumber,
    host: schema.isString,
    auth: {
        username: schema.isAlphanumeric([5]),
        password: schema.minLength([10])
    },
    httpsCa: schema.isString
}
module.exports.check = schema.hasErrors;