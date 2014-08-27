var val = require('validator');

module.exports = function (dbConnection) {
    var r = dbConnection.r,
        x = dbConnection.createModel("User", {
            id: String,
            username: {
                _type: String,
                validator: function (name) {
                    return name.length >= 1
                    && name.length <= 256
                    && val.isAlphanumeric(name)
                }
            },
            displayName: {
                _type: String,
                validator: function (name) {
                    return name.length >= 1
                    && name.length <= 256
                    && val.isAlphanumeric(name)
                }
            },
            passHash: {
                _type: String,
                validator: function (hash) {
                    return hash.length === 128;
                }
            },
            passSalt: {
                _type: String,
                validator: function(salt) {
                    return salt.length === 44;
                }
            },
            lockupVersion: {
                _type: Number,
                default: 1
            },
            created: {
                _type: Date,
                default: r.now(),
                options: {
                    enforce_extra: false
                }
            }
        }, {
            enforce_type: 'strict',
            enforce_extra: true
        });
    x.ensureIndex('username');
    return x;
}