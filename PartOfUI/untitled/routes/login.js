const express = require('express');
const getRouter = express.Router();
const postRouter = express.Router();

const mysql = require('mysql');
// var connection = mysql.createConnection({
//     host: '127.0.0.1',
//     user: 'root',
//     password: 'mysql',
//     database: 'loginInfo'
// });

const pool = mysql.createPool({
    connectionLimit: 100,
    host:     '127.0.0.1',
    user:     'root',
    password: 'mysql',
    database: 'usbaccess'
});


const crypto = require('crypto');
//const md5 = crypto.createHash("md5");
//md5.update("abcdef").digest("hex");


/* Present the page of login  */
getRouter.get('/login', function(req, res) {
    res.clearCookie('authorized');
    res.clearCookie('dashboard');
    res.clearCookie('room_number');
    res.clearCookie('start_date');
    res.clearCookie('end_date');
    res.clearCookie('sensor_type');
    res.render('login', {flag: 0});
});


/* Deal with the login request */
postRouter.post('/login', function (req, res) {
    let name = req.body.userId;
    let pass = crypto.createHash("md5").update(req.body.password).digest("hex");

    //if (strings.replace(/(^s*)|(s*$)/g, "").length ==0)
    if (req.body.userId.replace(/(^s*)|(s*$)/g, "").length ==0 || req.body.password.replace(/(^s*)|(s*$)/g, "").length ==0) {
        console.log("UserId and password cannot be null.");
        res.render('login', {flag: 2});
        return;
    }
    //var pass = req.body.password;
    console.log("userId = " + name);
    console.log("hash_pwd = " + pass);

    pool.getConnection((error, connection) => {

        console.log("-------------------- Login in: Get a db connection from the pool --------------------");
        if (error) throw error;

        //Search the database according to the userId.
        var sql = 'SELECT hash, dashboard FROM login_info WHERE user_id = "' + name + '";';
        console.log(sql);

        connection.query(sql, function(err, result) {

            if (err) {
                console.log('-------------------- **** Error **** --------------------');
                console.log(err);
                res.render('login', {flag: 1});
            }else if (result.length == 0) {
                console.log('Login Error: Please enter a correct userId.');
                res.render('login', {flag: 1});
            } else {
                console.log('-------------------- **** result **** --------------------');
                //转换json
                var message = JSON.stringify(result);
                message = JSON.parse(message);
                console.log(message);
                console.log(message[0].hash);
                console.log(message[0].dashboard);

                if (message[0].hash == pass) {
                    console.log('-------------------- * Login Succeed * --------------------');
                    //res.cookie = "authorized=" + req.body.userId + "; path = /";
                    res.cookie("authorized", name, {path: '/'});
                    res.cookie("dashboard", message[0].dashboard, {path: '/'});

                    //res.redirect("/occupant");
                    if (message[0].dashboard == 'occupant' || message[0].dashboard == 'researcher') {
                        console.log('Redirect to /', message[0].dashboard);
                        res.redirect("/" + message[0].dashboard);
                    } else {
                        console.log(("Direct to /Jump"));
                        res.redirect("/jump");
                    }
                } else {
                    console.log('Login Failed: Please enter a correct userId and password.');
                    res.render('login', {flag: 1});
                }
            }
            console.log('-------------------- *************** --------------------\n\n');
        });
        //connection.end();
        connection.release();
        console.log("-------------------- Login in: Release the db connection --------------------");
    });
})

exports.get = getRouter;
exports.post = postRouter;