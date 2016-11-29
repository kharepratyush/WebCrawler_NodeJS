var express = require('express');
var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');


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


var index=1;
var arr = [];//array of links --update to absolute and relative if need arises
var visited = []; //mapping to mark visited URls

/*Function allLinks take the Links from the Homepage and then throttle it to limit of 5*/
function allLinks(arr){
	level = 1;
	for(;index<6;index=index+1)
	{
		Link(arr[index],level);
		if(index==5) break; //No increment after index reaches 5 to throttle maximum number of connections
	}	
}

function Link(url,level)
{

	/*Base Cases : Url should be defined and index should be less than length of array*/
	if(url === undefined)
	{ 	
		console.log(index); return; 
	}
	
	if(index>arr.length)
	{ 
		console.log(index); return; 
	}

	console.log(level+":"+index+":"+url+":"+arr.length);

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
    						arr.push($(link).attr('href'));
    						visited[$(link).attr('href')]=1;
						}
					}
				}
			});
		}

		if(error)
			console.log(error);

		/*Call Function for next URL from the queue*/
		index=index+1;
		if(index>arr.length) return;

		/*Setting timegap between two calls*/
		setTimeout(Link(arr[index],level+1),30);
	});
}


app.get('/scrap', function(req, res){
	
	url = 'https://www.medium.com/';
	console.log(url);
	visited[url]=1;
	arr.push(url);

	fs.writeFile('test.csv', url+',\n', function (err) {
  		if (err) return console.log(err);
	});

	request(url, function(error, response, html){

        if(!error)
        {
        	$ = cheerio.load(html);
  			
  			links = $('a');//hyperlinks
  			
  			$(links).each(function(i, link)
  			{
    			if(isUrl($(link).attr('href')))
    			{
    				if($(link).attr('href').indexOf("medium.com") > -1) 
    				{
    					if(visited[$(link).attr('href')] !== 1)
    					{ 
    						arr.push($(link).attr('href'));
    						visited[$(link).attr('href')]=1;
						}
					}
				}
			});

			/*Passing Links of homepage to Throttling Function*/
			allLinks(arr);
  			res.send("test");
        }

        if(error)
        	console.log(error);

	});
});


app.listen(3000, function () {
  console.log('App listening on port 3000!')
});
