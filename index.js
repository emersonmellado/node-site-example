const express = require('express');
const app = express();
const port = 3000;
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const url = 'mongodb://localhost:27017';

const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });

//This is what you use to have multipart form data
const multer = require('multer');
// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img/superheroes')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage });
app.use('/', express.static('public'));

//Setting up pug as template engine
//using the convention to have all views in views folder.
app.set('view engine', 'pug');

app.get('/', (req, res) => {
    //internal scope of this function
	MongoClient.connect(url, function(err, client) {
		const db = client.db('comics');
		const collection = db.collection('superheroes');

		collection.find({}).toArray((error, documents) => {
            client.close();
            const indexVariables = {
                pageTitle: "First page of our app",
                superheroes: documents
            }
            res.render('index', { variables: indexVariables });
		});
	});
});

app.get('/create', (req, res) => {
    //internal scope of this function
    res.render('create');
})

app.get('/superheroes/', (req, res) => {
    //internal scope of this function
    res.render('superhero', { superheroes: superheroes });
});

app.get('/superheroes/:id', (req, res) => {
    //internal scope of this function
    MongoClient.connect(url, function(err, client) {
		const db = client.db('comics');
		const collection = db.collection('superheroes');
        const selectedId = req.params.id;

		collection.find({"_id": ObjectID(selectedId)}).toArray((error, documents) => {
            client.close();
            res.render('superhero', { superheroe: documents[0] });
		});
	});
});

app.post('/superheroes', upload.single('file'), (req, res) => {
    //internal scope of this function
    const newId = superheroes[superheroes.length - 1].id + 1;

    const newSuperHero = {
        id: newId,
        name: req.body.superhero.toUpperCase(),
        image: req.file.filename
    }

    superheroes.push(newSuperHero);

    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});