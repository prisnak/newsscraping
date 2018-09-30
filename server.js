// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require request and cheerio. This makes the scraping possible
// To get the url html or Json to take the response
var request = require("request");
// It let's you Parse True HTML using Jquery in Node
var cheerio = require("cheerio");
var bodyParser = require("body-parser");
var logger = require("morgan");
var ejs = require("ejs");

// Initialize Express
var app = express();
app.set('view engine', 'ejs');

//show more information about what is happening
app.use(logger("dev"));

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

// Database configuration
var databaseUrl = "fashionnews";
var collections = ["scrapedFashionNews"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  // res.send("Hello world");
  res.render('pages/index');
});

// Retrieve data from the db
app.get("/news", function(req, res) {
  request("https://www.theguardian.com/fashion/", function(error, response, html) {
    // Load the html body from request into cheerio
    var $ = cheerio.load(html);
    // For each element with a an specific class from the website
    $(".js-headline-text").each(function(i, element) {
      // Save the text and href of each link enclosed in the current element
      var title = $(this).text();
      var link = $(this).attr("href");

      // If this found element had both a title and a link
      if (title && link) {
        // Insert the data in the scrapedData db
        db.scrapedFashionNews.insert({
          title: title,
          link: link
        },
        function(err, inserted) {
          if (err) {
            // Log the error if one is encountered during the query
            console.log(err);
          }
          else {
            // Otherwise, log the inserted data
            console.log(inserted);
          }
        });
      }
    });
  });

  // Find all results from the collection in the db
  db.scrapedFashionNews.find({}, function(error, found) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      res.json(found);
    }
  });
});


// res.render('pages/news', function(found){
//   $(".news").append("<div class='result'>" + found +"</div>")
// });


// // Scrape data from one site and place it into the mongodb db
// app.get("/scrape", function(req, res) {
//   // Make a request for the news section of the website
//   request("https://www.theguardian.com/fashion/", function(error, response, html) {
//     // Load the html body from request into cheerio
//     var $ = cheerio.load(html);
//     // For each element with a an specific class from the website
//     $(".js-headline-text").each(function(i, element) {
//       // Save the text and href of each link enclosed in the current element
//       var title = $(this).text();
//       var link = $(this).attr("href");

//       // If this found element had both a title and a link
//       if (title && link) {
//         // Insert the data in the scrapedData db
//         db.scrapedFashionNews.insert({
//           title: title,
//           link: link
//         },
//         function(err, inserted) {
//           if (err) {
//             // Log the error if one is encountered during the query
//             console.log(err);
//           }
//           else {
//             // Otherwise, log the inserted data
//             console.log(inserted);
//           }
//         });
//       }
//     });
//   });
//   // Send a "Scrape Complete" message to the browser
//   // res.redirect('pages/news');
// });


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
