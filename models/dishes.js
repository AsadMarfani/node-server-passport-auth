var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
var Currency = mongoose.Types.Currency;

var commentsSchema = new Schema({
  rating: {
    type: Number,
    required: true
  },
  comment: {
    type: String
  },
  author: {
    type: String,
    required: true
  }
});
var dishSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String
  },
  label: {
    type: String,
    default: ""
  },
  price: {
    type: Currency,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  comments: [commentsSchema]
}, {timestamps: true});

var Dishes = mongoose.model('Dish', dishSchema);
module.exports = Dishes;