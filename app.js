var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser  = require("body-parser");
var passport    = require("passport");
var LocalStrategy = require("passport-local");
app.use(require('method-override')('_method'));
var passportLocalMongoose = require("passport-local-mongoose");
var User = require("./models/user");
var Book = require("./models/books");
var issueBook = require("./models/issuebooks");
app.use(express.static('dist')); 
app.set("view engine","ejs");
var cors=require("cors"),
bcrypt=require("bcryptjs"),
     jwt =require("jsonwebtoken"),
     ExtractJwt =require('passport-jwt').ExtractJwt,
     JwtStrategy= require('passport-jwt').Strategy;
mongoose.connect("mongodb://chintu:chintu@ds119969.mlab.com:19969/meanlibrary");
// mongoose.connect("mongodb://localhost/project2");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.use(require("express-session")({
    secret: "Chintu is the best!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
require('./passport')(passport);

// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
 });


app.get("/",function(req,res){
    res.render("start");
});
app.get("/user",isLoggedIn,function(req,res){
    res.render("user");
});

//========Adding new book and saving it ==========
app.get("/newbook",function(req,res){
    res.render("newbook");
});
app.post("/newbook",function(req,res){
    Book.create({
        name:req.body.name,
        publisher:req.body.publisher,
        author:req.body.author,
        units:req.body.units,
        issuedunits:req.body.issuedunits,
        availableunits:req.body.availableunits,
        description:req.body.description
    },function(err,createdBook){
        if(err){
            console.log(err)
        }
        else{
            console.log(createdBook);
            // res.redirect("/adminallbooks");
            res.json(createdBook);
        }
    });
});

//=======Requesting a book=======
app.put("/request/:bookid/:userid",function(req,res){
    User.findById(req.params.userid,function(err,foundUser){
        if(err){
            console.log(err)
        } else {
            Book.findById(req.params.bookid,function(err,foundBook){
                if(err){
                    console.log(err);
                }
                else{
                    issueBook.create({
                        bookID:foundBook._id,
                        bookname:foundBook.name,
                        userID:foundUser._id,
                        username:foundUser.name
                    },function(err,issbook){
                        if(err){
                            console.log(err);
                        }
                        else{
                            console.log(issbook);
                        }
                    });
                    foundBook.availableunits=(foundBook.availableunits-1);
                    foundBook.issuedunits=(foundBook.issuedunits+1);
                    foundBook.save((err,book)=>{
                       
                        return res.json(book);

                    });
                    // Book.find({},function(err,books){
                    //     if(err){
                    //         console.log(err)
                    //     } else{
                    //         console.log('bo==oks',books)
                    //         res.json(books);
                    //     }
                    // }) 
                    // res.redirect("/allbooks");
                    // res.json();
                }
            }); 
        }
               
    })
});

//======Accepting a requested book======
app.delete("/accept/:bookid/:userid",function(req,res){
    
    issueBook.findByIdAndRemove(req.params.bookid,function(err,foundBook){
        if(err){
            console.log(err);
        }
        else{
            Book.findById(foundBook.bookID,function(err,ibook){
                if(err){
                    console.log(err)
                }
                else{
                    User.findById(req.params.userid,function(err,foundUser){
                        if(err){
                            console.log(err)
                        }
                        else{ 
                            var book = {id:ibook._id,name:ibook.name,issuedon: new Date()};
                            console.log("ibook",ibook)
                            foundUser.booksissued.push(book);
                            foundUser.save();
                            console.log(foundUser.booksissued);
                            // res.json(foundUser);
                        }
                    })
                }
            })
            // res.redirect("/admin");
            issueBook.find(function(err,books){
                res.json(books);
            })
        }
    });
    
    
});

//======Finding and displaying all books=======
app.get("/allbooks",function(req,res){
    Book.find({},function(err,books){
        if(err){
            console.log(err)
        }
        else{
            issueBook.find({},function(err,issuebooks){
                if(err){
                    console.log(err)
                }
                else{
                        // res.render("allbooks1",{books:books});
                        res.json(books)
                    } 
            });          
        }
    });
});

//======displaying issued books=======
app.get("/issuedbooks/:id",function(req,res){
    User.findById(req.params.id,function(err,foundUser){
        if(err){
            console.log(err)
        }
        else{
            // res.render("issuedbooks",{foundUser:foundUser});
            res.json(foundUser.booksissued);
        }
    })
});

//=======Returning issued book======
app.put("/return/:rbookid/:userid",function(req,res){
    console.log('====',req.params.rbookid)
    console.log('====!!!!',req.params.userid)
    User.findById(req.params.userid,function(err,foundUser){
        if(err){
            console.log(err);
        }
        else{
            
            var bookissue = foundUser.booksissued;
            
            bookissue.forEach(function(id){
                console.log("id",id.id);
                if(id._id.equals(req.params.rbookid)){
                    Book.findById(id.id,function(err,foundBook){
                        if(err){
                            console.log(err);
                        }
                        else{
                            
                            foundBook.availableunits=(foundBook.availableunits+1);
                            foundBook.issuedunits=(foundBook.issuedunits-1);
                            foundBook.save();
                        
                        }
                    })
                } 
            });
            foundUser.booksissued.remove({_id:req.params.rbookid});
            foundUser.save();   
            // res.redirect("/issuedbooks");   
            res.json(foundUser.booksissued);      
            
            
        }
        
    });
});

//========displaying book details=====/
app.get("/bookdetails/:id",function(req,res){
    Book.findById(req.params.id,function(err,foundBook){
        if(err){
            console.log(err);
        }
        else{
            // res.render("showbook",{foundBook:foundBook});
            res.json(foundBook);
        }
    })
    
})
//=======Searching a book======//
app.post("/search",function(req,res){
    Book.find({},function(err,books){
        if(err){
            console.log(err)
        }
        else{
            
            // res.render("search",{books:books,search:req.body.search});
            res.json(books);
        }
    });
});
//=========Sorting by name======//
app.post("/sort",function(req,res){
    
    Book.find((err, books) => {
        if (err) {
          console.log(err);
        } else {
        //   res.render("sort", { books: books });
        res.json(books)
        }
      }).sort({ name: 'asc' });
    
});

//========Admin viewing books======//
app.get("/adminallbooks",passport.authenticate('jwt',{session:false}),function(req,res){
    // console.log('xcddd');
    Book.find({},function(err,books){
        if(err){
            console.log(err);
        }
        else{
            // console.log()
            console.log(req.user);
            res.json(books);
            // res.render("adminallbooks",{books:books});
        }
    });
});

//=========Admin updating books=======
// app.get("/update/:id",function(req,res){
//     Book.findById(req.params.id,function(err,book){
//         res.render("updatebook",{book:book});
//     });
// });
app.put("/update/:id",function(req,res){
    
    Book.findByIdAndUpdate(req.params.id,req.body,{new:true},function(err,book){ 
        if(err){
            console.log(err);
        }
        else{
            res.json(book);
        }
    });
});

//=======Admin deleteing books=======
app.delete("/delete/:id",function(req,res){
    Book.findByIdAndRemove(req.params.id,function(err,deletedBook){
        if(err){
            console.log(err);
        }
        else{
            // console.log("deleted Book",deletedBook);
            // res.redirect("/admin");
            res.json(deletedBook);
        }
    });
});

//====admin and displaying requested books=====


app.get("/admin",function(req,res){
    issueBook.find({},function(err,books){
        if(err){
            console.log(err)
        }
        else{
            // res.render("admin",{books:books});
            res.json(books);
        }
    })
});

//=======Signing up a user======
app.get("/signup",passport.authenticate('jwt',{session:false}),function(req,res){
    // res.render("signup");
    res.json(req.user);

});
// app.post("/signup",function(req,res){
    
//     var newUser = new User({
//         name: req.body.name, 
//         dob: req.body.dob, 
//         gender: req.body.gender,
//         phone:req.body.phone,
//         username:req.body.username,
//     });
//     console.log('===========',newUser)
//     User.register(newUser, req.body.password, function(err, user){
//         if(err){
//             console.log(err);
//             return res.render("login");
//         }
//         passport.authenticate("local")(req, res, function(){
//             // res.redirect("/user"); 
//             res.json(newUser);
//         });        
//     });
// });
app.post("/signup",function(req,res)
	{   console.log('req.body',req.body);
		var newUser=new User(req.body);
		var password=req.body.password;
             bcrypt.genSalt(10,(err,salt)=>{
             	bcrypt.hash(password,salt,(err,hash)=>{
             		if(err) throw err;
             		newUser.password=hash;
					 newUser.save((err,user)=>{
						 if(err)
						return res.json({success:false,msg:"This username is already registered !"});
						 if(user)
					    res.json({success:true,msg:"You are Registered"});				 
					 });
             	});
             });	
	});

//========LOGIN and Logout========
app.get("/login",function(req,res){
    res.render("login");
});
// app.post("/login", passport.authenticate("local", 
//     {
//         // successRedirect: "/successjson",
//         // failureRedirect: "/failurejson",
//         successRedirect: "/user",
//         failureRedirect: "/login"
//     })
//     , function(req, res){
//         // res.json({message:"Success", username: req.user.username});
//     }
// );
app.post('/login',(req,res,next)=>{
    const username =req.body.username;
	const password =req.body.password;
    
	User.findOne({username:username},(err,user)=>{
        if(err) 
        {
            res.json({success:false, msg:"Somthing went wrong"});
            
            throw err;
        }
		if(!user)
		{
            return res.json({success:false, msg:"User not found !"});
		}
		User.comparePassword(password,user.password,(err,isMatch)=>{
            if(err) {
                res.json({success:false, msg:"Somthing went wrong"});
                throw err;
            }
            if(isMatch)
            {
                console.log('logged in');
                const token=jwt.sign({data: user},'Hello world',{
                    expiresIn:604800  // 1 Week
                });
                // const loggeduser=
            // req.user = user;
            // console.log("hehehe",req.user)            
            // console.log("hehehe11111",user)            
			res.json({
				success:true, 
				msg:"Successfully login",
				token:`Bearer ${token}`,
				user:{
                    _id        :   user._id,
                    name      :   user.name,
                    username  :   user.username,
                    dob      :   user.dob,
                    gender   :   user.gender,
                    phone     :   user.phone,
                    booksissued:[] =   user.booksissued
                } 
			});	
		}
		else
		{
			return res.json({success:false,msg:"Wrong password"});
		}
		});
	});

});

app.get("/logout", function(req, res){

    req.logout();
    // res.redirect("/");
    console.log("User Logged Out!!");
    res.json();
});


function isLoggedIn(req, res, next){
        if(req.isAuthenticated()){
            if(req.user.username==="admin"){
                res.redirect("/admin");
            }else{
                return next();
            }  
            }
        else{
            res.redirect("/login");
        }
    }
    


app.listen(process.env.PORT,process.env.IP,function(err){
    console.log("server started");
})
