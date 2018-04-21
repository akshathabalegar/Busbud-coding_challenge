// Import 'File System' module in project
var fs = require("fs");
var http = require('http');
// Change port from '2345' to '3456' as per requirement
var port = process.env.PORT || 3456;

module.exports = http.createServer(function (req, res) {
  res.writeHead(404, {'Content-Type': 'text/plain'});

	// If URL accessing without any query string
	if (req.url.indexOf('/suggestions') === 0) {

		//default
		if(req.url === '/suggestions' || req.url ===  '/suggestions?'){
		  res.end(JSON.stringify({
			  suggestions: []
			}));
	    }
		else if(req.url != '/suggestions' ){

		 // Read content from tsv file in project 'data' folder
			fs.readFile( "\data//cities_canada-usa.tsv", 'utf8', function (err, data) {

				var row=data.split("\n");
				var result = [];
				var column = row[0].split("\t");
				var results = '';

				for(var i=1;i<row.length;i++){
					var cityobject = {};
					var currentline=row[i].split("\t");

					for(var j=0;j<column.length;j++){
					  if(column[j] == "ascii" || column[j] == "lat" || column[j] == "long" || column[j] == "country"){
							cityobject[column[j]] = currentline[j];
					  }
					}
					results = cityobject;
					result.push(cityobject);
				}

				//http://127.0.0.1:3456/suggestions?q=Toronto&lat=43.70011
				if(getParams(req.url).hasOwnProperty('lat')){
					if(getParams(req.url).lat != ''){
						result = result.filter( element => element.lat === (getParams(req.url).lat.trim()));
					}
				}

				//http://127.0.0.1:3456/suggestions?q=Toronto&lat=43.70011&long=-79.4163
				if(getParams(req.url).hasOwnProperty('long')){

					if(getParams(req.url).long != ''){
						result = result.filter( element => element.long === (getParams(req.url).long.trim()));
					}
				}

				//http://127.0.0.1:3456/suggestions?q=Toronto
				if(getParams(req.url).hasOwnProperty('q')){
						var results = [];

            result.forEach(function(cityobject){
							var items = Object.keys(cityobject);
							items.sort();
							var name = getParams(req.url).q.trim();
              
							items.forEach(function(items) {
                  if( (cityobject[items].toLowerCase().indexOf((decodeURI(name)).toLowerCase()) >= 0)===true && cityobject[items].startsWith(name) === true){
									           results.push(cityobject);
								  }
							});
						});
						result = results;
				}
				  res.end(JSON.stringify({
					result
				}));

				});
			}
		}else {
			res.end();
		}
	}).listen(port, '127.0.0.1');

console.log('Server running at http://127.0.0.1:%d/suggestions', port);



function getParams(url) {
	var regex = /[?&]([^=#]+)=([^&#]*)/g, params = {}, match;
	while(match = regex.exec(url)) {
		params[match[1]] = match[2];
	}
	return params;
}
