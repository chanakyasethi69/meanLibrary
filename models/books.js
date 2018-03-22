var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var bookSchema = new mongoose.Schema({
    name:{
          type: String
         },
    publisher:{
        type: String
       },
    author:{
        type: String
           },
    units:{
        type: Number
        },
    issuedunits:{
        type: Number
    },
    availableunits:{
        type: Number
    },
    description:{
        type:String
    }
});


module.exports = mongoose.model("Book", bookSchema);