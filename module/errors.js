/*
	there seems to be a lot of "right" ways to do this. I decided that I would
	use the way provided by MDN, they seem reliable :)
	http://goo.gl/1qvOzK
*/
function ExistingUserErr(message, original) {
    this.name = "ExistingUserErr";
    this.message = message || "Existing user with that name";
    if (original) {
        this.original = original;
    }
}
ExistingUserErr.prototype = new Error();
ExistingUserErr.prototype.constructor = ExistingUserErr;
module.exports.ExistingUserErr = ExistingUserErr;

function NonExistingUserErr(message, original) {
    this.name = "NonExistingUserErr";
    this.message = message || "User did not exist";
    if (original) {
        this.original = original;
    }
}
NonExistingUserErr.prototype = new Error();
NonExistingUserErr.prototype.constructor = NonExistingUserErr;
module.exports.NonExistingUserErr = NonExistingUserErr;

function BadOptionsErr(message, original) {
    this.name = "BadOptionsErr";
    this.message = message || "You entered bad options";
    if (original) {
        this.original = original;
    }
}
BadOptionsErr.prototype = new Error();
BadOptionsErr.prototype.constructor = BadOptionsErr;
module.exports.BadOptionsErr = BadOptionsErr;

function PassHashErr(message, original) {
    this.name = "PassHashErr";
    this.message = message || "Hashing failed";
    if (original) {
        this.original = original;
    }
}
PassHashErr.prototype = new Error();
PassHashErr.prototype.constructor = PassHashErr;
module.exports.PassHashErr = PassHashErr;

function DatabaseErr(message, original) {
    this.name = "DatabaseErr";
    this.message = message || "Rethinkdb error";
    if (original) {
        this.original = original;
    }
}
DatabaseErr.prototype = new Error();
DatabaseErr.prototype.constructor = DatabaseErr;
module.exports.DatabaseErr = DatabaseErr;