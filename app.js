
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

process.env['REVIEW_QUERY_SERVICE_HOST']='geoservice-review-cafe.192.168.99.100.nip.io';
process.env['REVIEW_QUERY_SERVICE_PORT']='80';
process.env['REVIEW_QUERY_SERVICE_PATH']='ws/data/';

app.get('/within', (req, res) => {
    var greeter = "http://" 
    	+ process.env.REVIEW_QUERY_SERVICE_HOST 
    	+ ":" + process.env.REVIEW_QUERY_SERVICE_PORT 
        + "/" + process.env.REVIEW_QUERY_SERVICE_PATH
    	+ "within?type=cafe&lat1=" + req.query['lat1'] + "&lat2=" + req.query['lat2'] + "&lon1=" + req.query['lon1'] + "&lon2=" + req.query['lon2'];
    console.log('greeter: ' + greeter);
    res.send(get(greeter));
});

app.get('/all', (req, res) => {
    var greeter = "http://" 
    	+ process.env.REVIEW_QUERY_SERVICE_HOST 
    	+ ":" + process.env.REVIEW_QUERY_SERVICE_PORT 
        + "/" + process.env.REVIEW_QUERY_SERVICE_PATH
    	+ "/?type=cafe";
    console.log('greeter: ' + greeter);

    res.send(get(greeter));
});

function get(url) {
	return require('sync-request')('GET', url).getBody();
}


app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));


probe(app);


app.listen(8080, ip);



module.exports = app;
