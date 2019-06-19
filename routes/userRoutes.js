let express = require("express")

let userRoutes = express.Router();

const authenticate = require("../middleware/jwt");


// =============================================

let User = require("../models/user.model");
let studentSchema = require('../models/student.model');
let teacherSchema = require('../models/teacher.model');

userRoutes.post("/signup", (request, response, next) => {
    //console.log(request.body);
    let user = {
        name: request.body.name,
        email: request.body.email,
        password: request.body.password
    };
    if (request.body.role === "teacher") {
        user = new teacherSchema(user);
    }
    else if (request.body.role === "student") {
        user = new studentSchema(user);
    }
    else {
        return response.status(403).json({ message: "Invalid User Type"});
    }
    user.save((err, user) => {
        if (!err) {
            response.status(200).json({ "token": user.generateJwt() });
        } else {
            console.log(err);
            if (err.code == 11000)
                response.status(409).json({ message: 'Email already exist With that rule'});
            else
                return next(err);
        }
    })
})

userRoutes.post("/signin", (req, res) => {
    //console.log(req.body);
    User.findOne({ email: req.body.email, role: req.body.role },
        (err, user) => {
            if (err)
                res.status(404).json(err);
            // unknown user or wrong password
            else if (!user || !user.verifyPassword(req.body.password))
                res.status(401).json({ message: 'No such account' });
            // authentication succeeded
            else
                res.status(200).json({ "token": user.generateJwt() });
        });
});

userRoutes.use(authenticate);


userRoutes.get("", (req, res) => {
    User.findById(req._id, (err, user) => {
        if (err) {
            console.log(err);
            res.status(404).send(err);
        }
        else {
            res.status(200).send(user);
        }
    })
})

userRoutes.put("", (req, res, next) => {
    console.log(req.body);
    User.update({ _id: req._id },
        req.body, err => {
            if (!err) {
                User.findById(req._id, (err, result) => {

                    if (!err) {
                        console.log(result);
                        res.status(200).send(result);
                    }
                    else {
                        console.log(err);
                        return next(err);
                    }
                })
            }
            else {
                console.log(err);
                return next(err);
            }
        })
})
module.exports = userRoutes;