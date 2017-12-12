var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var Dishes = require('../models/dishes');
var Verify = require('./verify');

var dishRouter = express.Router();
dishRouter.use(bodyParser.json());

dishRouter
  .route('/')
  .get(Verify.verifyOrdinaryUser, function (req, res) {
    Dishes
      .find({})
      .populate('comments.postedBy')
      .exec(function (err, dish) {
        if (err)
          throw err;
        res.json(dish);
      });
  })
  .post(Verify.verifyOrdinaryUser, Verify.VerifyAdmin, function (req, res) {
    Dishes
      .create(req.body, function (err, dish) {
        if (err)
          throw err;
        console.log("Dish Created", dish);
        var dishId = dish._id;
        res.writeHead(200, {'Content-type': 'text/plain'});
        res.end("Added the dish with ID : " + dishId);
      });
  })
  .delete(Verify.verifyOrdinaryUser, Verify.VerifyAdmin, function (req, res) {
    Dishes
      .remove({}, function (err, resp) {
        if (err)
          throw err;
        res.json(resp);
      });
  });

dishRouter
  .route('/:dishId')
  .all(Verify.verifyOrdinaryUser)
  .get(function (req, res) {
    Dishes
      .findById(req.params.dishId)
      .populate('comments.postedBy')
      .exec(function (err, dish) {
        if (err)
          throw err;
        res.json(dish);
      });
  })
  .put(Verify.VerifyAdmin,function (req, res) {
    Dishes
      .findByIdAndUpdate(req.params.dishId, {
        $set: req.body
      }, {
        new: true
      }, function (err, dish) {
        if (err)
          throw err;
        res.json(dish);
      });
  })
  .delete(Verify.VerifyAdmin,function (req, res) {
    Dishes
      .findByIdAndRemove(req.params.dishId, function (err, resp) {
        if (err)
          throw err;
        res.json(resp);
      })
  });

dishRouter
  .route('/:dishId/comments')
  .all(Verify.verifyOrdinaryUser)
  .get(function (req, res) {
    Dishes
      .findById(req.params.dishId)
      .populate('comments.postedBy')
      .exec(function (err, dish) {
        if (err)
          throw err;
        res.json(dish.comments);
      })
  })
  .post(function (req, res) {
    Dishes
      .findById(req.params.dishId, function (err, dish) {
        if (err)
          throw err;
          console.log("Req, decoded",req.decoded);
        req.body.postedBy = req.decoded._id;
        dish
          .comments
          .push(req.body);
        dish.save(function (err, dish) {
          console.log("Comment has been post");
          res.json(dish);
        })
      })
  })
  .delete(Verify.VerifyAdmin,function (req, res) {
    Dishes
      .findById(req.params.dishId, function (err, dish) {
        if (err)
          throw err;
        for (var i = 0; i < dish.comments.length; i++) {
          dish
            .comments
            .id(dish.comments[i]._id)
            .remove();
        }
        dish
          .save(function (err, dish) {
            if (err)
              throw err;
            res.json(dish);
          })
      })
  });

dishRouter
  .route('/:dishId/comments/:commentId')
  .all(Verify.verifyOrdinaryUser)
  .get(function (req, res) {
    Dishes
      .findById(req.params.dishId)
      .populate('comments:postedBy')
      .exec(function (err, dish) {
        if (err)
          throw err;
        res.json(dish.comments.id(req.params.commentId));
      });
  })
  .put(function (req, res) {
    Dishes
      .findById(req.params.dishId, function (err, dish) {
        var subDoc = dish
          .comments
          .id(req.params.commentId);
        // req.body.postedBy = req.decoded._doc._id;
        subDoc.set(req.body);
        dish
          .save()
          .then(function (savedDish) {
            res.json(savedDish);
          })
          .catch(function (err) {
            res
              .status(500)
              .send(err);
          });
      });
  })
  .delete(function (req, res) {
    Dishes
      .findById(req.params.dishId, function (err, dish) {
        if (err)
          throw err;
        if (dish.comments.id(req.params.commentId).postedBy != req.decoded._id) {
          var err = new Error('You are not allowed to perform this action');
          err.message = "Not authenticated";
          err.status = 403;
          return next(err);
        }
        dish
          .comments
          .id(req.params.commentId)
          .remove();
        console.log('Deleted partcicular comment ' + dish);
        dish.save(function (err, resp) {
          if (err)
            throw err;
          res.json(resp);
        })
      });
  });

module.exports = dishRouter;
