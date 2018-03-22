

var mongoose = require("mongoose");
var localpassportmongoose=require("passport-local-mongoose");

var issueSchema = new mongoose.Schema({
    bookID:{
        type: mongoose.Schema.Types.ObjectId
    },
    bookname:{
        type:String
    },
    userID:{
        type: mongoose.Schema.Types.ObjectId
    },
    username:{
        type:String
    }
});

module.exports=mongoose.model("IssueBooks",issueSchema);