var express = require('express');
var router = express.Router();
var passport = require('passport');
var path = require('path');
var processPropertyCSV = require('../modules/store.property.csv.js');
var processDatasetCSV = require('../modules/store.dataset.csv.js');
var processCityCSV = require('../modules/store.city.csv.js');
var poolModule = require('../modules/pool.js');
var pool = poolModule;
var calcReportDate = require('../modules/reportdate.js');

let reportDate = calcReportDate();

//RETRIEVE STATE DROPDOWN INFORMATION ON HOMEPAGE
router.get('/states', function (req, res) {
  pool.connect(function (errorConnecting, db, done) {
    if (errorConnecting) {
      console.log('Error connecting ', errorConnecting);
      res.sendStatus(500);
    } else {
      var queryText = `SELECT "dbo_RPRT_Property"."State" 
      FROM "dbo_RPRT_Property"
      JOIN "dbo_RPRT_Dataset"
      ON "dbo_RPRT_Property"."Report_Dataset_ID" = "dbo_RPRT_Dataset"."Report_Dataset_ID"
      WHERE "dbo_RPRT_Dataset"."Period_Type_ID" = 2
      AND "dbo_RPRT_Dataset"."Period_Year" = $1
      AND SUBSTRING("dbo_RPRT_Dataset"."Dataset_Label",1,1) = $2
      GROUP BY "dbo_RPRT_Property"."State";`
      db.query(queryText, [reportDate.year, reportDate.quarter], function (errorMakingQuery, result) {
        done();
        if (errorMakingQuery) {
          console.log('errorMakingQuery', errorMakingQuery);
          res.sendStatus(500);
        } else {
          res.send(result.rows);
        }
      });
    }
  });//end of pool
});
  
//RETRIEVE MARKET DROPDOWN INFORMATION ON HOMEPAGE
router.get('/markets/:state', function (req, res) {
  let state = req.params.state;
  pool.connect(function (errorConnecting, db, done) {
    if (errorConnecting) {
      console.log('Error connecting ', errorConnecting);
      res.sendStatus(500);
    } else {
      var queryText = `SELECT "dbo_RPRT_Property"."Submarket" 
      FROM "dbo_RPRT_Property"
      JOIN "dbo_RPRT_Dataset"
      ON "dbo_RPRT_Property"."Report_Dataset_ID" = "dbo_RPRT_Dataset"."Report_Dataset_ID" 
      WHERE "dbo_RPRT_Property"."State" = $1
      AND "dbo_RPRT_Dataset"."Period_Year" = $2
      AND SUBSTRING("dbo_RPRT_Dataset"."Dataset_Label",1,1) = $3
      GROUP BY "dbo_RPRT_Property"."Submarket";`;
      db.query(queryText, [state, reportDate.year, reportDate.quarter], function (errorMakingQuery, result) {
        done();
        if (errorMakingQuery) {
          console.log('errorMakingQuery', errorMakingQuery);
          res.sendStatus(500);
        } else {
          res.send(result.rows);
        }
      });
    }
  });//end of pool
});

//RETRIEVE ALL DATA
router.get('/all', function (req, res) {
  let state = req.query.state;
  let year = req.query.year;
  let quarter = req.query.quarter;
  let market = req.query.market;
  pool.connect(function (errorConnecting, db, done) {
    if (errorConnecting) {
      console.log('Error connecting ', errorConnecting);
      res.sendStatus(500);
    } else {
      var queryText = `SELECT "dbo_RPRT_Property"."Property_SubType" as "Class",
          COUNT("dbo_RPRT_Property"."Property_SubType") as "Total_Buildings", 
          SUM("dbo_RPRT_Property"."Building_Size") as "NRA", 
          SUM("dbo_RPRT_Property"."Squarefeet_Vacant") as "Vacant_Space", 
          SUM("dbo_RPRT_Property"."Squarefeet_Sublease") as "Sublease_Space",
          (SUM("dbo_RPRT_Property"."Squarefeet_Vacant")/SUM("dbo_RPRT_Property"."Building_Size")*100)::numeric(4,2) as "Percent_Vacant",
          (SUM("dbo_RPRT_Property"."Squarefeet_Vacant")/SUM("dbo_RPRT_Property"."Building_Size")*100)::numeric(4,2) as "Percent_Vacant_With_Sublease",
          SUM("dbo_RPRT_Property"."Absorption") as "Absorption",
          (SUM("dbo_RPRT_Property"."Rate_Low") + SUM("dbo_RPRT_Property"."Rate_Low"))/COUNT("dbo_RPRT_Property"."Property_SubType") as "Avg_Rate",
          SUM("dbo_RPRT_Property"."Total_Op_Expenses_Taxes")/COUNT("dbo_RPRT_Property"."Property_SubType") as "OE_T"
          FROM "dbo_RPRT_Property"
          JOIN "dbo_RPRT_Dataset"
          ON "dbo_RPRT_Property"."Report_Dataset_ID" = "dbo_RPRT_Dataset"."Report_Dataset_ID"
          WHERE "dbo_RPRT_Dataset"."Period_Type_ID" = 2
          AND "dbo_RPRT_Property"."State" = $1 
          AND "dbo_RPRT_Dataset"."Period_Year" = $2
          AND SUBSTRING("dbo_RPRT_Dataset"."Dataset_Label",1,1) = $3 
          AND "dbo_RPRT_Property"."Submarket" = $4
          GROUP BY "dbo_RPRT_Property"."Property_SubType";`;
      db.query(queryText, [state, year, quarter, market], function (errorMakingQuery, result) {
        done();
        if (errorMakingQuery) {
          console.log('errorMakingQuery', errorMakingQuery);
          res.sendStatus(500);
        } else {
          res.send(result.rows);
        }
      });
    }
  });//end of pool
});

//Total Direct Absorption line graph
router.get('/absorption', function (req, res) {
  let state = req.query.state;
  let market = req.query.market;
  pool.connect(function (errorConnecting, db, done) {
    if (errorConnecting) {
      console.log('Error connecting ', errorConnecting);
      res.sendStatus(500);
    } else {
      var queryText = `SELECT "dbo_RPRT_Property"."Property_SubType" as "Class",
        "dbo_RPRT_Dataset"."Period_Year" || '-' || SUBSTRING("dbo_RPRT_Dataset"."Dataset_Label",1,1) as "Time",
        SUM("dbo_RPRT_Property"."Absorption") as "Absorption"
        FROM "dbo_RPRT_Property"
        JOIN "dbo_RPRT_Dataset"
        ON "dbo_RPRT_Property"."Report_Dataset_ID" = "dbo_RPRT_Dataset"."Report_Dataset_ID"
        WHERE "dbo_RPRT_Dataset"."Period_Type_ID" = 2
        AND "dbo_RPRT_Property"."State" = $1        
        AND "dbo_RPRT_Property"."Submarket" = $2
        GROUP BY "dbo_RPRT_Property"."Property_SubType", "dbo_RPRT_Dataset"."Dataset_Label", "dbo_RPRT_Dataset"."Period_Year"
        ORDER BY "Time";
        `;
      db.query(queryText, [state, market], function (errorMakingQuery, result) {
        done();
        if (errorMakingQuery) {
          console.log('errorMakingQuery', errorMakingQuery);
          res.sendStatus(500);
        } else {
          res.send(result.rows);
        }
      });
    }
  });//end of pool
});

//Vacancy Rate bar chart
router.get('/vacancy', function (req, res) {
  let state = req.query.state;
  let market = req.query.market;
  pool.connect(function (errorConnecting, db, done) {
    if (errorConnecting) {
      console.log('Error connecting ', errorConnecting);
      res.sendStatus(500);
    } else {
      var queryText = `SELECT "dbo_RPRT_Property"."Property_SubType" as "Class",
        "dbo_RPRT_Dataset"."Period_Year" || '-' || SUBSTRING("dbo_RPRT_Dataset"."Dataset_Label",1,1) as "Time",
        (SUM("dbo_RPRT_Property"."Squarefeet_Vacant")/SUM("dbo_RPRT_Property"."Building_Size")*100)::numeric(4,2) as "Squarefeet_Vacant"
        FROM "dbo_RPRT_Property"
        JOIN "dbo_RPRT_Dataset"
        ON "dbo_RPRT_Property"."Report_Dataset_ID" = "dbo_RPRT_Dataset"."Report_Dataset_ID"
        WHERE "dbo_RPRT_Dataset"."Period_Type_ID" = 2
        AND "dbo_RPRT_Property"."State" = $1         
        AND "dbo_RPRT_Property"."Submarket" = $2
        GROUP BY "dbo_RPRT_Property"."Property_SubType", "dbo_RPRT_Dataset"."Dataset_Label", "dbo_RPRT_Dataset"."Period_Year"
        ORDER BY "Time";
        `;
      db.query(queryText, [state, market], function (errorMakingQuery, result) {
        done();
        if (errorMakingQuery) {
          console.log('errorMakingQuery', errorMakingQuery);
          res.sendStatus(500);
        } else {
          res.send(result.rows);
        }
      });
    }
  });//end of pool
});

//RETRIEVE LIST OF PROPERTIES FOR MARKET PAGE
router.get('/marketproperties', function (req, res) {
  let state = req.query.state;
  let year = req.query.year;
  let quarter = req.query.quarter;
  let market = req.query.market;
  pool.connect(function (errorConnecting, db, done) {
    if (errorConnecting) {
      console.log('Error connecting ', errorConnecting);
      res.sendStatus(500);
    } else {
      var queryText = `SELECT "dbo_RPRT_Property"."Property_SubType" as "Class",
        "dbo_RPRT_Property"."Report_Property_ID" as "Property_Id",
        "dbo_RPRT_Property"."Submarket" as "Submarket",
        ("dbo_RPRT_Property"."Building_Size") as "NRA", 
        ("dbo_RPRT_Property"."Squarefeet_Vacant") as "Vacant_Space", 
        ("dbo_RPRT_Property"."Squarefeet_Sublease") as "Sublease_Space",
        ("dbo_RPRT_Property"."Absorption") as "Absorption",
        "dbo_RPRT_Property"."Rate_Low" as "Low Rate",
        "dbo_RPRT_Property"."Rate_Low" as "High Rate",
        "dbo_RPRT_Property"."Total_Op_Expenses_Taxes" as "OE_T",
        "dbo_RPRT_Property"."X_Coordinate" as "Y",
        "dbo_RPRT_Property"."Y_Coordinate" as "X",
        "dbo_RPRT_Property"."Address_1" as "Address",
        "dbo_RPRT_Property"."State" as "State",
        "dbo_PROP_City"."City" as "City"
        FROM "dbo_RPRT_Property"
        JOIN "dbo_RPRT_Dataset"
        ON "dbo_RPRT_Property"."Report_Dataset_ID" = "dbo_RPRT_Dataset"."Report_Dataset_ID"
        JOIN "dbo_PROP_City"
        ON "dbo_RPRT_Property"."City_ID" = "dbo_PROP_City"."City_ID"
        WHERE "dbo_RPRT_Dataset"."Period_Type_ID" = 2
        AND "dbo_RPRT_Property"."State" = $1 
        AND "dbo_RPRT_Dataset"."Period_Year" = $2
        AND SUBSTRING("dbo_RPRT_Dataset"."Dataset_Label",1,1) = $3 
        AND "dbo_RPRT_Property"."Submarket" = $4;
        `;
      db.query(queryText, [state, year, quarter, market], function (errorMakingQuery, result) {
        done();
        if (errorMakingQuery) {
          console.log('errorMakingQuery', errorMakingQuery);
          res.sendStatus(500);
        } else {
          res.send(result.rows);
        }
      });
    }
  });//end of pool
});

//RETRIEVE SPECIFIC PROPERTY DATA FOR PROPERTY PAGE
router.get('/propertydata', function (req, res) {
  let state = req.query.state;
  let year = req.query.year;
  let quarter = req.query.quarter;
  let market = req.query.market;
  let propid = req.query.propid;
  pool.connect(function (errorConnecting, db, done) {
    if (errorConnecting) {
      console.log('Error connecting ', errorConnecting);
      res.sendStatus(500);
    } else {
      var queryText = `SELECT "dbo_RPRT_Property"."Report_Property_ID",
      "dbo_RPRT_Property"."Property_SubType" as "Class",
      "dbo_RPRT_Property"."Year_Built",
      "dbo_RPRT_Property"."Year_Renovated",
      "dbo_RPRT_Property"."Building_Size" as "NRA",
      "dbo_RPRT_Property"."Number_Of_Floors",
      "dbo_RPRT_Property"."Divisible_Min",
      "dbo_RPRT_Property"."Divisible_Max",
      "dbo_RPRT_Property"."Squarefeet_Taxes",
      "dbo_RPRT_Property"."Squarefeet_OP_Expenses",
      "dbo_RPRT_Property"."Total_Op_Expenses_Taxes",
      "dbo_RPRT_Property"."Squarefeet_Available" as "Squarefeet_Available",
      "dbo_RPRT_Property"."Squarefeet_Vacant" as "Vacant_Space", 
      "dbo_RPRT_Property"."Squarefeet_Sublease" as "Sublease_Space",
      (("dbo_RPRT_Property"."Squarefeet_Vacant")/("dbo_RPRT_Property"."Building_Size")*100)::numeric(4,2) as "Percent_Vacant",
      (("dbo_RPRT_Property"."Squarefeet_Vacant")/("dbo_RPRT_Property"."Building_Size")*100)::numeric(4,2) as "Percent_Vacant_With_Sublease",
      ("dbo_RPRT_Property"."Absorption") as "Absorption",
      "dbo_RPRT_Property"."Rate_Low",
      "dbo_RPRT_Property"."Rate_High",
      "dbo_RPRT_Property"."X_Coordinate" as "Y",
      "dbo_RPRT_Property"."Y_Coordinate" as "X",
      "dbo_PROP_City"."City" as "City",
      "dbo_RPRT_Property"."Address_1" as "Address",
      "dbo_RPRT_Property"."State" as "State",
      "dbo_RPRT_Property"."Submarket"
      FROM "dbo_RPRT_Property"
      JOIN "dbo_RPRT_Dataset"
      ON "dbo_RPRT_Property"."Report_Dataset_ID" = "dbo_RPRT_Dataset"."Report_Dataset_ID"
      JOIN "dbo_PROP_City"
      ON "dbo_RPRT_Property"."City_ID" = "dbo_PROP_City"."City_ID"
      WHERE "dbo_RPRT_Dataset"."Period_Type_ID" = 2
      AND "dbo_RPRT_Property"."State" = $1 
      AND "dbo_RPRT_Dataset"."Period_Year" = $2
      AND SUBSTRING("dbo_RPRT_Dataset"."Dataset_Label",1,1) = $3 
      AND "dbo_RPRT_Property"."Submarket" = $4
      AND "dbo_RPRT_Property"."Report_Property_ID" = $5;`
      db.query(queryText, [state, year, quarter, market, propid], function (errorMakingQuery, result) {
        done();
        if (errorMakingQuery) {
          console.log('errorMakingQuery', errorMakingQuery);
          res.sendStatus(500);
        } else {
          res.send(result.rows);
        }
      });
    }
  });//end of pool
});

// stores data from property data table CSV upload
router.post('/csv/property/', function (req, res) {
  if (req.isAuthenticated) {
    var dataInfo = {
      uploadedData: [],
      user: req.user,
      fileName: req.files.file.name,
      data: req.files.file.data
    };

      processPropertyCSV(dataInfo)
      .then((result) => {
        res.sendStatus(200);
      })
      .catch((error) => {
        console.log('caught failure somewhere in processPropertyCSV');
        res.sendStatus(500);
      });
    // });
  }
});

router.post('/csv/city/', function (req, res) {
  if (req.isAuthenticated) {
    var dataInfo = {
      uploadedData: [],
      user: req.user,
      fileName: req.files.file.name,
      data: req.files.file.data
    };

      processCityCSV(dataInfo)
      .then((result) => {
        res.sendStatus(200);
      })
      .catch((error) => {
        console.log('caught failure somewhere in processCityCSV');
        res.sendStatus(500);
      });
    // });
  }
});

router.post('/csv/dataset/', function (req, res) {
  if (req.isAuthenticated) {
    var dataInfo = {
      uploadedData: [],
      user: req.user,
      fileName: req.files.file.name,
      data: req.files.file.data
    };

      processDatasetCSV(dataInfo)
      .then((result) => {
        res.sendStatus(200);
      })
      .catch((error) => {
        console.log('Failure in processDatasetCSV');
        res.sendStatus(500);
      });
    // });
  }
});

//CONTACT FORM COMMENT SUBMISSION
router.post('/contact', function (req, res) {
  var comment = req.body;
  pool.connect(function (errorConnecting, db, done) {
      if (errorConnecting) {
          console.log('Error connecting', errorConnecting);
          res.sendStatus(500);
      } else {
          var queryText = 'INSERT INTO "messages" ("email", "address", "size", "time", "phone", "notes") VALUES ($1, $2, $3, $4, $5, $6);';
          db.query(queryText, [comment.email, comment.address, comment.size, comment.time, comment.phone, comment.notes], function (errorMakingQuery, result){
              done();
              if (errorMakingQuery) {
                  console.log('errorMakingQuery', errorMakingQuery);
                  res.sendStatus(500);
              } else {
                  res.send(result.rows);
              }
          })
      }
  }) //end of pool
}) // end of post

//RETRIEVE COMMENT SUBMISSION MESSAGES FOR ADMINISTRATION MESSAGES VIEW
router.get('/contact', function (req, res) {
  pool.connect(function (errorConnecting, db, done) {
    if (errorConnecting) {
      console.log('Error connecting ', errorConnecting);
      res.sendStatus(500);
    } else {
      var queryText = `SELECT * FROM "messages"`
      db.query(queryText, function (errorMakingQuery, result) {
        done();
        if (errorMakingQuery) {
          console.log('errorMakingQuery', errorMakingQuery);
          res.sendStatus(500);
        } else {
          res.send(result.rows);
        }
      });
    }
  });//end of pool
});//end of GET

//DELETE A MESSAGE FROM THE ADMINISTRATION MESSAGES VIEW
router.delete('/contact/:id', function (req, res) {
  if (req.isAuthenticated()) {
      var messageToDelete = req.params.id;
      pool.connect(function (errorConnecting, db, done) {
          if (errorConnecting) {
              console.log('Error connecting', errorConnecting);
              res.sendStatus(500);
          } else {
              var queryText = 'DELETE FROM "messages" WHERE "id" = $1;'
              db.query(queryText, [messageToDelete], function (errorMakingQuery, result) {
                  done();
                  if (errorMakingQuery) {
                      console.log('errorMakingQuery', errorMakingQuery);
                      res.sendStatus(500);
                  } else {
                      res.send(result.rows);
                  }
              })
          }
      }) //end of pool
  } else {
      res.sendStatus(401);
  }
}) // end of post

module.exports = router;