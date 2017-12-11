var express = require('express');
var router = express.Router();

var passport = require('passport');
var User = require('../models/user');
var Verify = require('./verify');

//Get All Users
router.get('/',Verify.verifyOrdinaryUser, Verify.VerifyAdmin,function (req, res, next) {
  User.find({}, function(err, users){
    if(err)
    return res.status(500).json({err: err});
    else {
      res.status(200).json(users);
    }
  })
});

//Register User
router.post('/register', function (req, res) {
  // var userIno = {...req.body};
  // delete userInfo.password;
  // {username: req.body.username, admin: req.body.admin}
  User
    .register(new User({username: req.body.username, admin: req.body.admin}), req.body.password, function (err, user) {
      if (err)
        return res.status(500).json({err: err});
      passport.authenticate('local')(req, res, function () {
        return res
          .status(200)
          .json({status: 'Registration Successfull!'});
      });
    });
});

//Login User
router.post('/login', function (req, res, next) {
  passport
    .authenticate('local', function (err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res
          .status(401)
          .json({err: info});
      }
      // console.log("User is  : ", user);
      req
        .logIn(user, function (err) {
          if (err) {
            return res
              .status(500)
              .json({err: 'Could not log in user'});
          }
          console.log('User in users: ', user);

          var token = Verify.getToken(user._doc);
          res.status(200).json({status: 'Login Successfull', success: true, token: token
        });
        });
    })(req, res, next)
});
//Logout User
router.get('/logout', function (req, res) {
  req.logout();
  res
    .status(200)
    .json({status: 'Bye!'});

});

module.exports = router;
