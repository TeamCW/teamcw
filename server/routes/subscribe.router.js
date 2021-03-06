var express = require('express');
var router = express.Router();
var request = require('request');
var pool = require('../modules/pool.js');
const API_KEY = process.env.API_KEY;
var username = 'cushwake';

router.get('/', function (req, res) {
    let uri = 'https://' + username + ':' + API_KEY + '@us17.api.mailchimp.com/3.0/lists/8bb5bb9fba/members';
    let mcSubs = [];
    let dbSubs = [];
    request({ method: 'GET', uri: uri }, function (err, response, body) {
        if (err) {
            console.log('Error searching', err);
            res.sendStatus(500);
        } else {
            let mcResult = JSON.parse(body);
            for (let i = 0; i < mcResult.members.length; i += 1) {
                mcSubs.push(mcResult.members[i].email_address)
            }
            pool.connect(function (err, client, done) {
                if (err) {
                    console.log("Error connecting: ", err);
                    res.sendStatus(500);
                }
                client.query("SELECT email_address FROM subscribers",
                    function (err, result) {
                        done();
                        if (err) {
                            console.log("Error inserting data: ", err);
                            res.sendStatus(500);
                        } else {
                            for (let j = 0; j < result.rows.length; j += 1) {
                                dbSubs.push(result.rows[j].email_address);
                            }
                            for (let k = 0; k < mcSubs.length; k += 1) {
                                if (!dbSubs.includes(mcSubs[k])) {
                                    pool.connect(function (errorConnectingToDb, db, done) {
                                        if (errorConnectingToDb) {
                                            // There was an error and no connection was made
                                            console.log('Error connecting', errorConnectingToDb);
                                            res.sendStatus(500);
                                        } else {
                                            let queryText = 'INSERT INTO subscribers (email_address) VALUES ($1)'
                                            db.query(queryText, [mcSubs[k]], function (err, result) {
                                                done();
                                                if (err) {
                                                    res.sendStatus(500);
                                                }
                                            })
                                        }
                                    });
                                }
                            }
                        }
                    });
            });
            res.sendStatus(200);
        }
    });
});

router.get('/:email', function (req, res) {
    let emailToCheck = req.params.email;
    let emailExist = false;
    pool.connect(function (errorConnecting, db, done) {
        if (errorConnecting) {
            console.log('Error connecting ', errorConnecting);
            res.sendStatus(500);
        } else {
            var queryText = `SELECT * FROM subscribers WHERE email_address = $1`;
            db.query(queryText, [emailToCheck], function (errorMakingQuery, result) {
                done();
                if (errorMakingQuery) {
                    console.log('errorMakingQuery', errorMakingQuery);
                    res.sendStatus(500);
                } else {
                    if(result.rows.length === 0) {
                        res.send(false)
                    } else {
                        res.send(true);
                    }
                }
            });
        }
    });//end of pool
});

module.exports = router;