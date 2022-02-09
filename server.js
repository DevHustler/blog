// Libraries
var express = require('express');
var app = express();
var path = require('path');
var mongo = require('mongodb').MongoClient;
var db_url = "mongodb://localhost:27017/";
var bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');
var http = require('http');
var formidable = require('formidable');
var fs = require('fs');

// Required
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));   // Static Folder Path

// CRUD OPERATIONS

app.use(bodyParser.urlencoded({
    extended: true
}))

app.post('/insertPost', function(req, res){
    mongo.connect(db_url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("blog");
        dbo.collection("posts").insertOne(req.body, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();
        });
        res.render('pages/create');
    }); 
});

// Paths
app.get('/', function(req, res) {
    mongo.connect(db_url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("blog");
        var ms = {_id: -1}
        dbo.collection('posts').find().sort(ms).limit(5).toArray().then(results => {
            console.log(results)
            res.render('pages/index', {posts: results});
        });
    });
});

app.get('/admin', function(req, res) {
    mongo.connect(db_url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("blog");
        dbo.collection('posts').find().toArray().then(results => {
            res.render('pages/create_blog', {posts: results});
        });
    });
});

app.get('/create', function(req, res) {
    res.render('pages/create');
});

app.get('/edit', function(req, res) {
    res.render('pages/edit', {data: req.query});
});

app.post('/edit', function(req, res) {
    mongo.connect(db_url, function(err, db) {
        if (err) throw err;
        var data = req.body;
        var dbo = db.db("blog");
        var title = data['title'];
        var image = data['image'];
        var desc = data['desc'];
        var id = data['id'];
        console.log('ID: ' + id + " TITLE: " + title + " DESC: " + desc + " IMAGE: " + image);
        var myquery = { _id: ObjectId(id) };
        var newvalues = { $set: {title: title, image: image, desc: desc } };
        console.log('MYQUERY: ' + myquery['_id']);
        console.log('NEWVALS: ' + newvalues['$set']['title']);
        dbo.collection("posts").updateOne(myquery, newvalues, function(err, res) {
            if (err) throw err;
            console.log(res.result + " document updated");
            db.close();
        });
    }); 
    mongo.connect(db_url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("blog");
        const cur = dbo.collection('posts').find().toArray().then(results => {
            res.render('pages/create_blog', {posts: results});
        });
    });
});

app.get('/show_page', function(req, res) {
    res.render('pages/show_page', {data: req.query});
});

app.get('/blog_page', function(req, res) {
    mongo.connect(db_url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("blog");
        const cur = dbo.collection('posts').find().toArray().then(results => {
            res.render('pages/blog_page', {posts: results});
        });
    });
});

app.get('/delete', function(req, res){
    mongo.connect(db_url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("blog");
        var data = req.query;
        var id = data['id'];
        var myquery = { _id: ObjectId(id) };
        dbo.collection("posts").deleteOne(myquery, function(err, obj) {
            if (err) throw err;
            console.log("1 document deleted");
            db.close();
        });
    });
    mongo.connect(db_url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("blog");
        dbo.collection('posts').find().toArray().then(results => {
            res.render('pages/create_blog', {posts: results});
        });
    });
})

// Server
app.listen(8080);
console.log('Server Started At: http://127.0.0.1:8080');