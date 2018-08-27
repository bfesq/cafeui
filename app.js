
var express = require('express'),
    fs = require('fs'),
    app = express();

var app = express();

var request = require('sync-request');

const probe = require('kube-probe');

var ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

var path = require('path');

// app is running!
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});


http://geoservice-review-cafe.192.168.99.100.nip.io/ws/data/?type=cafe

process.env['GEO_QUERY_SERVICE_HOST']='geoservice-review-cafe.192.168.99.100.nip.io';
process.env['GEO_QUERY_SERVICE_PORT']='80';
process.env['GEO_QUERY_SERVICE_PATH']='ws/data/';


process.env['REVIEW_QUERY_SERVICE_HOST']='reviewquery-review-cafe.192.168.99.100.nip.io';
process.env['REVIEW_QUERY_SERVICE_PORT']='80';
process.env['REVIEW_QUERY_SERVICE_PATH']='ws/data/';


process.env['REVIEW_UPDATE_SERVICE_HOST']='reviewupdate-review-cafe.192.168.99.100.nip.io';
process.env['REVIEW_UPDATE_SERVICE_PORT']='80';
process.env['REVIEW_UPDATE_SERVICE_PATH']='ws/data/';

app.get('/within', (req, res) => {
    var greeter = "http://" 
    	+ process.env.GEO_QUERY_SERVICE_HOST 
    	+ ":" + process.env.GEO_QUERY_SERVICE_PORT 
        + "/" + process.env.GEO_QUERY_SERVICE_PATH
    	+ "within?type=cafe&lat1=" + req.query['lat1'] + "&lat2=" + req.query['lat2'] + "&lon1=" + req.query['lon1'] + "&lon2=" + req.query['lon2'];
    res.send(get(greeter));
});

app.get('/all', (req, res) => {
    var greeter = "http://" 
    	+ process.env.GEO_QUERY_SERVICE_HOST 
    	+ ":" + process.env.GEO_QUERY_SERVICE_PORT 
        + "/" + process.env.GEO_QUERY_SERVICE_PATH
    	+ "/?type=cafe";

    res.send(get(greeter));
});

app.get('/searchall', (req, res) => {
    var greeter = "http://" 
    	+ process.env.GEO_QUERY_SERVICE_HOST 
    	+ ":" + process.env.GEO_QUERY_SERVICE_PORT 
        + "/" + process.env.GEO_QUERY_SERVICE_PATH
    	+ "/searchall?type=cafe&searchterm="+ req.query['searchterm'];;

    res.send(get(greeter));
});

app.get('/review', (req, res) => {
    var greeter = "http://" 
    	+ process.env.REVIEW_QUERY_SERVICE_HOST 
    	+ ":" + process.env.REVIEW_QUERY_SERVICE_PORT 
        + "/" + process.env.REVIEW_QUERY_SERVICE_PATH
    	+ "/?geoid=" + req.query['geoid'];

    res.send(get(greeter));
});

app.get('/reviewavg', (req, res) => {
    var greeter = "http://" 
    	+ process.env.REVIEW_QUERY_SERVICE_HOST 
    	+ ":" + process.env.REVIEW_QUERY_SERVICE_PORT 
        + "/" + process.env.REVIEW_QUERY_SERVICE_PATH
    	+ "/avg?geoid=" + req.query['geoid'];

    res.send(get(greeter));
});

app.get('/reviewrandomadd', (req, res) => {
    var greeter = "http://" 
    	+ process.env.REVIEW_UPDATE_SERVICE_HOST 
    	+ ":" + process.env.REVIEW_UPDATE_SERVICE_PORT 
        + "/" + process.env.REVIEW_UPDATE_SERVICE_PATH
    	+ "/addrandomreview?geoid=" + req.query['geoid'];
    console.log('greeter: ' + greeter);

    res.send(get(greeter));
});

app.post('/reviewadd', (req, res) => {
    var greeter = "http://" 
    	+ process.env.REVIEW_UPDATE_SERVICE_HOST 
    	+ ":" + process.env.REVIEW_UPDATE_SERVICE_PORT 
        + "/" + process.env.REVIEW_UPDATE_SERVICE_PATH
    	+ "/update";
    console.log('greeter: ' + greeter);
    console.log('req.body: ' + req.body);

    res.send(post(greeter, req.body));
});

function get(url) {
	return require('sync-request')('GET', url).getBody();
}

function post(urlToPost, bodyToPost) {
    default_headers = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux i686; rv:7.0.1) Gecko/20100101 Firefox/7.0.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-us,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.7',
        'Cache-Control': 'max-age=0'
    };

    var request = require('sync-request'), default_headers;

    request({
        url: urlToPost,
        headers: default_headers,
        method: 'POST',
        body: JSON.stringify(bodyToPost) 
        }, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            console.log(body);
        }
    });

}


app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));


probe(app);


app.listen(8080, ip);



module.exports = app;
