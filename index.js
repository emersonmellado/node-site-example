const express = require('express');
const app = express();
const port = 3000;

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


//Index - Entry point - First page a user will see 
app.get('/', (req, res) => {
    //internal scope of this function
	MongoClient.connect(url, function(err, client) {
		const db = client.db('comics');
		const collection = db.collection('superheroes');

		collection.find({}).toArray((error, documents) => {
            client.close();
            documents.reverse();
            const indexVariables = {
                pageTitle: "First page of our app",
                superheroes: documents
            }
            res.render('index', { variables: indexVariables });
		});
	});
});

//Create endpoint
app.get('/create', (req, res) => {
    //internal scope of this function
    res.render('create');
})

//detail view
app.get('/superheroes/:id', (req, res) => {
    //internal scope of this function
    const selectedId = req.params.id;

    let selectedSuperhero = superheroes.filter(superhero => {
        console.log("Superhero: ", superhero.id, superhero.id === +selectedId);

        return superhero.id === +selectedId;
    });

    selectedSuperhero = selectedSuperhero[0];

    res.render('superhero', { superheroe: selectedSuperhero });
});

//delete endpoint
app.get('/delete/:id', (req, res) => {
    //internal scope of this function
    MongoClient.connect(url, function(err, client) {
		const db = client.db('comics');
		const collection = db.collection('superheroes');
        const idToDelete = req.params.id;

		collection.deleteOne({"_id": ObjectID(idToDelete)});
        client.close();
        res.redirect('/');
	});
});

app.post('/superheroes', upload.single('file'), (req, res) => {
    //internal scope of this function
    const newSuperHero = {
        name: req.body.superhero.toUpperCase(),
        image: req.file.filename
    }

    //Replace .push() to a mongodb call
    MongoClient.connect(url, function(err, client) {
		const db = client.db('comics');
		const collection = db.collection('superheroes');

        collection.insertOne(newSuperHero);
        
        client.close();
        res.redirect('/');
	});
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});