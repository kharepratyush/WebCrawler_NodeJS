# WebCrawler - NodeJs

Path : /scrap?depth=3

###indexWithoutAsync.js :

Implemenation of Web Crawler without using async library. Url : https://www.medium.com and MaximumDepth is hard-coded to 1. MaximumDepth can be modified by depth query.
All msgs/errors are shown on console.

####Used Packages:

* expredess
* cheerio
* request
* fs

#### Description : 
1. First request gathers all the links present on the HomePage and adds all the links in the queue implemented by arr[]
2. Method allLinks() throttle maximum connections to 5, calling Link() to crawl individual links.
3. Link() recursively calls itself upon completion so the concurrency remains 5 till queue has links left to crawl
4. visited[] marks all the visited Urls to prevent re-execution. 
5. depth[] saves the depth of the Url, for implementation of crawling upto a specific Depth.
6. Maximum Depth of crawling can be set by setting a variable MaximumDepth
7. robots.txt is followed and disallowed Urls are not scrapped.
8. test.csv stores the output in csv format.


###index.js :

Implemenation of Web Crawler using async library. Url : https://www.medium.com and MaximumDepth is hard-coded to 1. MaximumDepth can be modified by depth query.

####Used Packages:

* express
* cheerio
* request
* fs
* async

#### Description : 
1. async.queue() is used for throttling maximum connections.
2. Each valid Url found while scrapping is pushed to queue.
4. visited[] marks all the visited Urls to prevent re-execution. 
5. depth[] saves the depth of the Url, for implementation of crawling upto a specific Depth.
6. Maximum Depth of crawling can be set by setting a variable MaximumDepth
7. robots.txt is followed and disallowed Urls are not scrapped.
8. test.csv stores the output in csv format.
