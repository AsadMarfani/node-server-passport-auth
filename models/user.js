var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var PassportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
  username: String,
  password: String,
  firstname: {
    type: String,
    default: ''
  },
  lastname: {
    type: String,
    default: ''
  },
  admin: {
    type: Boolean,
    default: false
  }
});

User.methods.getName = function () {
  return (this.firstname + " " + this.lastname)
}

User.plugin(PassportLocalMongoose);

module.exports = mongoose.model('User', User);