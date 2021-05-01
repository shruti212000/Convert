const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const encoder = bodyParser.urlencoded();
const md5 = require("md5");
const passwordValidator = require("password-validator");

const multer = require('multer');
const path = require('path');
const helpers = require('./helpers');
//const popup = require("popups");

var schema = new passwordValidator();
schema.is().min(6).has().uppercase().has().lowercase().has().digits(1)

const app = express();
app.use("/assets", express.static("assets"));

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root123",
    database: "nodejs"
});

// connect to the database
connection.connect(function (error) {
    if (error) throw error
    else console.log("connected to the database successfully!")
});


app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index_two.html");
})

app.post("/", encoder, function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    if(schema.validate(password)){
        // console.log("true")
        var hashedLoginPwd = md5(password);

        connection.query("select * from loginuser where user_name = ? and user_pass = ?",
            [username, hashedLoginPwd], function (error, results, fields) {
                if (results.length > 0) {
                    res.redirect("/upload");
                } else {
                    res.redirect("/register");
                    console.log("incorrect credentials");
                }
                res.end();
            })
    }else{
        console.log("Password rules not followed")
        // popup.alert({
        //     content : "Password rules not followed"
        // })
    }
        
    

})
//register
app.post("/register", encoder, function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    

    if(schema.validate(password)){
        var hashedPwd = md5(password)

        connection.query("INSERT INTO loginuser(user_name, user_pass, email, first_name, last_name) VALUES (?, ?, ?, ?, ?)",
        [username, hashedPwd, email, firstName, lastName], function (err, results) {
            //console.log(results)
            if (err) {
                console.log("there was an error")
               //throw err;
            } else {
                console.log("1 record inserted");
                res.redirect("/upload");
            }
             res.end();
        })
    }else{
        console.log("register - pwd rules not followed")
    }

})

//upload
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },

    // By default, multer removes file extensions so add that
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

app.post("/upload", (req, res) => {
    var xlstojson = require("xls-to-json-lc");
    var xlsxtojson = require("xlsx-to-json-lc");
    
    let upload = multer({ storage: storage, fileFilter: helpers.file_Filter }).single('user_file');
    console.log("in post upload")
    upload(req, res, function(err) {
        // req.file contains information of uploaded file
        // req.body contains information of text fields, if there were any
        // console.log(req.file)
        console.log(req.body)
        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        }
        else if (!req.file) {
            return res.send('Please select a file to upload');
        }
        else if (err instanceof multer.MulterError) {
            return res.send(err);
        }
        else if (err) {
            return res.send(err);
        }

        if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
            exceltojson = xlsxtojson;
        } else {
            exceltojson = xlstojson;
        }
        try {
            exceltojson({
                input: req.file.path, //the same path where we uploaded our file
                output: null, //since we don't need output.json
                lowerCaseHeaders:true
            }, function(err,result){
                if(err) {
                    return res.json({error_code:1,err_desc:err, data: null});
                }
                res.json({error_code:0,err_desc:null, data: result});
            });
        } catch (e){
            res.json({error_code:1,err_desc:"Corupted excel file"});
        }
    });

        console.log("Your file has been uploaded")
        res.redirect("/transaction")
        console.log(req.file.path);
    });




// // when login is successfull
app.get("/upload", function (req, res) {
    res.sendFile(__dirname + "/upload.html")
    console.log("in get upload")
})

app.get("/register", function (req, res) {
    res.sendFile(__dirname + "/register.html")
})

app.get("/index_two", function (req, res) {
    res.sendFile(__dirname + "/index_two.html")
})

app.get("/transaction", function (req, res) {
    res.sendFile(__dirname + "/transaction.html")
})

app.listen(3000, function () {
    console.log("listening on port 4000 ")
});