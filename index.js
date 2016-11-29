var express = require('express');
var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');
var async = require("async");

var app = express();

/*Function to check if a Link is a proper Link or not*/
function isUrl(s) {
	var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
	return regexp.test(s);
}

/*Default Homepage*/
app.get('/', function(req, res) {
	res.send('Hello World!');
});

var visited = []; //mapping to mark visited URls
var depth = []; //mapping to save depth of each url

var q = async.queue(function(task, next) {
	console.log(depth[task.url] + ":" + task.url);
	url = task.url;
	Max = task.MaximumDepth;

	if (url === undefined) {
		next();
	}

	if (depth[url] > Max) {
		return;
	}
	//console.log(url);

	fs.appendFile('test.csv', url + ',\n', function(err) {
		if (err)
			console.log(err);
	});


	request(url, function(error, response, html) {
		if (!error) {
			$ = cheerio.load(html);

			links = $('a'); //hyperlinks

			$(links).each(function(i, link) {
				if (isUrl($(link).attr('href'))) {

					//Removing URls which are disallowed in robots.txt : https://medium.com/robots.txt
					if (($(link).attr('href').indexOf("medium.com/m/") > -1) || ($(link).attr('href').indexOf("medium.com/me/") > -1) || ($(link).attr('href').indexOf("medium.com/@") > -1) || ($(link).attr('href').indexOf("/edit") > -1)) {}

					//Only queuing the Allowed Urls
					else if ($(link).attr('href').indexOf("medium.com") > -1) {
						if (visited[$(link).attr('href')] !== 1) {
							if ($(link).attr('href') !== undefined) {
								if (depth[url] < Max) {
									q.push({
										url: $(link).attr('href'),
										MaximumDepth: Max
									}, function(err) {});
									visited[$(link).attr('href')] = 1;
									depth[$(link).attr('href')] = depth[url] + 1;
								}
							}
						}
					}
				}
			});
		}

		if (error)
			console.log(error);
		setTimeout(next(), 300);
	});
}, 5);


q.drain = function() {
	console.log('all items have been processed');
}


app.get('/scrap', function(req, res) {

	Url = 'https://www.medium.com/';
	//console.log(Url);
	visited[Url] = 1;
	depth[Url] = 0;

	//Maximum Depth to be Scrapped can be set from here
	var MaximumDepth = 3;

	//Create a empty file
	fs.writeFile('test.csv', '', function(err) {
		if (err) return console.log(err);
	});

	q.push({
		url: Url,
		MaximumDepth: MaximumDepth
	});
	res.send("OK");

});


app.listen(3000, function() {
	console.log('App listening on port 3000!')
});