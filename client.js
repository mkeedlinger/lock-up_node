// depends
var // http
    request = require('request'),
    https = require('https'),

    // helpers
    Promise = require('bluebird'),
    er = require('./module/errors'),
    schema = require('./module/objSchema');

requestPro = function (options) {
    return new Promise(function (resolve, reject) {
        request(options, function (err, req, body) {
            if (err) {
                reject(err);
            } else {
                resolve([req, body]);
            }
        });
    });
};

function createRequester (host, port, auth, httpsCa) {
    var f = function (api, arg1, arg2) {
        this.preApiUrl = "https://" + host + ":" + port + "/api/";
        return requestPro({
            uri: this.preApiUrl + api + "/" + arg1 + (arg2 ? '/' + arg2 : ''),
            auth: {
                user: auth.username,
                pass: auth.password,
                sendImmediately: true
            },
            strictSSL: true,
            ca: require('fs').readFileSync(httpsCa)
        }).catch(function (err) {
            throw new er.ClientErr(null, err);
        }).then(responseHandler);
    };
    return f;
}

function responseHandler (resAndBody) {
    var goodJson,
        body = resAndBody[1],
        res = resAndBody[0];
    try {
        body = JSON.parse(body);
        goodJson = !goodJson;
    } finally {
        console.l('body', body);
        body = body.result ? body.result : body;
        switch (res.statusCode) {
            case 200:
                return body;
            case 401:
                throw new er.BadAuthErr();
            case 409:
                throw new er.RequestErr(null, body);
            case 500:
                throw new er.InternalServerErr(null, body);
            default:
                throw new er.InternalServerErr("Server gave unexpected Status Code");
        }
    }
}

module.exports = function (options) {
    // check options..
    var optionErrors;
    optionErrors = schema.check(options, schema.clientSchema);
    if (optionErrors) {
        throw new er.BadOptionsErr(optionErrors);
    }

    var requester = createRequester(options.host, options.port, options.auth, options.httpsCa);

    var c = {};
    c.isExistantUsername = function (username) {
        return requester('isExistantUsername', username);
    };
    c.getId = function (username) {
        return requester('getId', username);
    };
    c.addUser = function (username, password) {
        password = encodeURIComponent(password);
        return requester('addUser', username, password);
    };
    c.getUserInfo = function (id) {
        return requester('getUserInfo', id);
    };
    c.isCorrectCredentials = function (username, password) {
        password = encodeURIComponent(password);
        return requester('isCorrectCredentials', username, password);
    };
    c.changePassword = function (id, newPass) {
        password = encodeURIComponent(newPass);
        return requester('changePassword', id, newPass);
    };
    c.deleteUser = function (id) {
        return requester('deleteUser', id);
    };
    c.changeUsername = function (id, newName) {
        return requester('changeUsername', id, newName);
    };
    return c;
}