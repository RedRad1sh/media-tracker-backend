const config = require('./config');
const User = require('../model/user/User');

let JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

module.exports = function (passport) {
    let opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = config.secret.key;

    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        // jwt_payload - это пользователь, но вместо id у него поле sub (подставляется автоматом библиотекой)
        User.findOne({_id: jwt_payload.sub}, function(err, user) {
            if (err) {
                return done(err, false);
            }
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    }));
}