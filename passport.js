var JwtStrategy 			=          require('passport-jwt').Strategy,
ExtractJwt 				    =          require('passport-jwt').ExtractJwt,
User                        =          require('./models/user');


module.exports=function(passport)
{
	let opts	={};
    
    opts.jwtFromRequest=ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey='Hello world';
    passport.use(new JwtStrategy(opts,(jwt_payload,done)=>{
    	User.findById(jwt_payload.data._id,(err,user)=>{
    		if(err)
    		{
    			return done(err,false);
    		}
    		if(user)
    		{
    			return done(null,user);

    		}
    		else
    		{
    			return done(null,false);
    		}

    	}
    		);
    }));

}
