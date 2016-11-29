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

/*Dafault Homepage*/
app.get('/', function (req, res) {
  res.send('Hello World!');
});

var visited = []; //mapping to mark visited URls

var q = async.queue(function (task, next) 
{    
    console.log(task.url);
    url = task.url;

    if(url === undefined)
	{ 	
		next(); 
	}
	
	//console.log(url);

	fs.appendFile('test.csv', url+',\n', function (err) {
		if(err)
			console.log(err);
	});

	request(url, function(error, response, html){
		if(!error){
        	$ = cheerio.load(html);
  			
  			links = $('a');//hyperlinks

  			$(links).each(function(i, link)
  			{
    			if(isUrl($(link).attr('href')))
    			{
    				if($(link).attr('href').indexOf("medium.com") > -1) 
    				{
    					if(visited[$(link).attr('href')] !== 1 )
    					{ 
    						if($(link).attr('href') !== undefined)
    						{	
    							q.push({url: $(link).attr('href')}, function (err) {});
    							visited[$(link).attr('href')]=1;
    						}
						}
					}
				}
			});
		}

		if(error)
			console.log(error);
		setTimeout(next(),30);
	});
},5);


// assign a callback
q.drain = function() {
    console.log('all items have been processed');
}


app.get('/scrap', function(req, res){
	
	Url = 'https://www.medium.com/';
	//console.log(Url);
	visited[Url]=1;

	fs.writeFile('test.csv', '', function (err) {
  		if (err) return console.log(err);
	});

	q.push({url : Url});
});


app.listen(3000, function () {
  console.log('App listening on port 3000!')
});
