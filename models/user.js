var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var bcrypt=require("bcryptjs");
var bookSchema = new mongoose.Schema({
    name:{
          type: String
         },
    id:{    
        type:mongoose.Schema.Types.ObjectId
    },
    issuedon:{
        type: Date 
    }
});

var UserSchema = new mongoose.Schema({
    name:String,
    dob:String,
    gender:String,
    phone:String,
    username:String,
    password: String,
    booksissued: [bookSchema]
});
module.exports = mongoose.model("User", UserSchema);

UserSchema.plugin(passportLocalMongoose);
module.exports.comparePassword=function(candidatePassword,hash,callback){
    bcrypt.compare(candidatePassword,hash,(err,isMatch)=>{
        if(err) throw err;
        callback(null,isMatch);
    });
}
 