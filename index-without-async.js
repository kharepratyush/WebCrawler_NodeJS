var express = require('express');
var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');


var app = express();

/*Function to check if a Link is a proper Link or not*/
function isUrl(s) 
{
   var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
   return regexp.test(s);
}

/*Dafault Homepage*/
app.get('/', function (req, res) 
{
  res.send('Hello World!');
});


var index=1;//global variable for Index marking
var arr = [];//array of links --update to absolute and relative if need arises
var visited = []; //mapping to mark visited URls
var depth = [];

/*Function allLinks take the Links from the Homepage and then throttle it to limit of 5*/
function allLinks(arr,MaximumDepth)
{
	if(MaximumDepth==0) return;

	for(;index<6;index=index+1)
	{
		Link(arr[index],MaximumDepth);
		if(index==5) break; //No increment after index reaches 5 to throttle maximum number of connections
	}	
}

function Link(url,MaximumDepth)
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

	if(depth[url]>MaximumDepth) return;

	console.log(depth[url]+":"+index+":"+url+":"+arr.length);

	fs.appendFile('test.csv', url+',\n', function (err) 
	{
		if(err)
			console.log(err);
	});

	request(url, function(error, response, html)
	{
		if(!error)
		{
        	$ = cheerio.load(html);
  			
  			links = $('a');//list of hyperlinks

  			$(links).each(function(i, link)
  			{
    			if(isUrl($(link).attr('href')))
    			{
    				//Removing URls which are disallowed in robots.txt : https://medium.com/robots.txt
    				if(($(link).attr('href').indexOf("medium.com/m/") > -1) 
    					|| ($(link).attr('href').indexOf("medium.com/me/") > -1)
    					|| ($(link).attr('href').indexOf("medium.com/@") > -1)
    					|| ($(link).attr('href').indexOf("/edit") > -1))
    					{}

    				else if($(link).attr('href').indexOf("medium.com") > -1) 
    				{
    					if(visited[$(link).attr('href')] !== 1 )
    					{ 
    						if(depth[url]<MaximumDepth)
    						{
								arr.push($(link).attr('href'));
    							visited[$(link).attr('href')]=1;
    							depth[$(link).attr('href')]=depth[url]+1;
    						}
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
		setTimeout(Link(arr[index],MaximumDepth),300);
	});
}

/*Scraping homepage to get initail list of links*/
app.get('/scrap', function(req, res)
{	
	url = 'https://www.medium.com/';
	console.log(url);
	
	visited[url]=1;
	arr.push(url);
	depth[url]=0;

	/*Maximum Depth can be set by changing value*/
	var MaximumDepth=2;

	fs.writeFile('test.csv', url+',\n', function (err) {
  		if (err) return console.log(err);
	});

	if(MaximumDepth==0)
	{
		res.send("Done");
		return;	
	} 

	/*Getting list of links from the Homepage*/
	request(url, function(error, response, html)
	{
        if(!error)
        {
        	$ = cheerio.load(html);
   			links = $('a');//all hyperlinks
  			
  			$(links).each(function(i, link)
  			{
  				//Checking Validity of URLs
    			if(isUrl($(link).attr('href')))
    			{
    				
    				//Removing URls which are disallowed in robots.txt : https://medium.com/robots.txt
    				if(($(link).attr('href').indexOf("medium.com/m/") > -1) 
    					|| ($(link).attr('href').indexOf("medium.com/me/") > -1)
    					|| ($(link).attr('href').indexOf("medium.com/@") > -1)
    					|| ($(link).attr('href').indexOf("/edit") > -1))
    					{}


    				//Checking if URL links within Medium.com
    				else if($(link).attr('href').indexOf("medium.com") > -1) 
    				{
						//Checking if link is pre-visited or not    					
    					if(visited[$(link).attr('href')] !== 1)
    					{ 
    						if(depth[url]<MaximumDepth)
    						{
								arr.push($(link).attr('href'));
    							visited[$(link).attr('href')]=1;
    							depth[$(link).attr('href')]=depth[url]+1;
    						}
						}
					}
				}
			});

			/*Passing Links of homepage to Throttling Function*/
			allLinks(arr,MaximumDepth);

  			res.send("test");
        }

        if(error)
        	console.log(error);

	});
});


app.listen(3000, function () {
  console.log('App listening on port 3000!')
});
