const passport = require('passport')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')


const LocalStrategy = require('passport-local').Strategy

const Admin = require('../models/Admin/Admin')


passport.serializeUser((user, done)=> {
    done(null, user.id)
})

passport.deserializeUser((id, done)=>{
    Admin.findById(id).then((user)=>{
        done(null, user)
    })
})




module.exports = passport => {
    passport.use(new LocalStrategy({
        usernameField : 'username', 
    },
        function(username, password, done) {
          console.log("INSIDE MIDDLEWARE ", username, password)
          Admin.findOne({ username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }

            bcrypt.compare(password, user.password)
            .then(isMatched => {
                if(!isMatched){
                    return done(null, false)
                }
                return done(null, user);
            })
          });
        }
      ));

}