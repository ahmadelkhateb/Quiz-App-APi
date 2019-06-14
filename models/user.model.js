const secret = "3D Diagnostix",
      Jwt_expireTime = "1hr";


const mongoose = require('mongoose'),
    options = { discriminatorKey: 'role' },
    bcrypt = require('bcryptjs'),
    jwt = require('jsonwebtoken');

let userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: "name can't be empty"
    },
    email: {
        type: String,
        required: "Email can't be empty",
    },
    password: {
        type: String,
        required: "Password can't be empty",
        minlength: [6, 'Password must be atleast 6 character long']
    },

    saltSecret: String
}, options);

// in case of the teacher want to use he same mail to create student account
// which means that each email have the ability to create to accounts of different types

userSchema.index({ email: 1, role: 1 }, { unique: true });

// Custom validation for email
userSchema.path('email').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,13}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');


// Events
userSchema.pre('save', function (next) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(this.password, salt, (err, hash) => {
            this.password = hash;
            this.saltSecret = salt;
            next();
        });
    });
});

// Methods
userSchema.methods.generateJwt = function () {
    return jwt.sign(
        {
            _id: this._id,
            role: this.role
        }, secret,
        {
            expiresIn: Jwt_expireTime
        }
    );
}

userSchema.methods.verifyPassword = function (password) {
    return bcrypt.compareSync(password, this.password)
}

module.exports = mongoose.model('User', userSchema);