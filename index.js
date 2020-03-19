const express = require('express');
const app = express();
const fs = require('fs');
const port = 3000;

//Mongoose implementation
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/comics', { useNewUrlParser: true, useUnifiedTopology: true });

//Mongoose Model (Work as a Schema)
const Superheroe = mongoose.model('Superheroe', {
    name: String,
    image: String
});

//MongoD implementation, will be removed soon
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

//Index - Entry point - First page a user will see 
app.get('/', async (req, res) => {
    //internal scope of this function
    const documents = await Superheroe.find().exec();

    const indexVariables = {
        pageTitle: "First page of our app",
        superheroes: documents
    }
    res.render('index', { variables: indexVariables });
});

//Create endpoint
app.get('/create', (req, res) => {
    //internal scope of this function
    res.render('create');
})

//detail view
app.get('/superheroes/:id', async (req, res) => {
    //internal scope of this function
    const selectedId = req.params.id;
    const document = await Superheroe.findById(selectedId).exec();

    res.render('superhero', { superheroe: document });
});

//update view
app.get('/update/:id', (req, res) => {
    //internal scope of this function
    MongoClient.connect(url, function (err, client) {
        const db = client.db('comics');
        const collection = db.collection('superheroes');
        const selectedId = req.params.id;

        collection.find({ "_id": ObjectID(selectedId) }).toArray((error, documents) => {
            client.close();
            res.render('update', { superheroe: documents[0] });
        });
    });
});

//delete endpoint
app.get('/delete/:id', (req, res) => {
    //internal scope of this function
    MongoClient.connect(url, function (err, client) {
        const db = client.db('comics');
        const collection = db.collection('superheroes');
        const idToDelete = req.params.id;

        //Delete the image on public/img/superheroes folder        
        collection.find({ "_id": ObjectID(idToDelete) }).toArray((error, documents) => {
            const dir = __dirname + "/public/img/superheroes/" + documents[0].image;
            if (fs.existsSync(dir)) {
                fs.unlink(dir, (err) => {
                    if (err) throw err;
                    console.log('successfully deleted images from folder superheroes');
                });
            }
        });

        collection.deleteOne({ "_id": ObjectID(idToDelete) });

        client.close();
        res.redirect('/');
    });
});

//Create post method
app.post('/superheroes', upload.single('file'), (req, res) => {
    //internal scope of this function
    const newSuperHero = {
        name: req.body.superhero.toUpperCase(),
        image: req.file.filename
    }

    const superheroe = new Superheroe(newSuperHero);
    superheroe.save()
    res.redirect('/');
});

//Update method superheroeUpdate
app.post('/superheroUpdate/:id', upload.single('file'), (req, res) => {

    MongoClient.connect(url, function (err, client) {
        const db = client.db('comics');
        const collection = db.collection('superheroes');
        const selectedId = req.params.id;

        //Delete the old hero image
        collection.find({ "_id": ObjectID(selectedId) }).toArray((error, documents) => {
            const dir = __dirname + "/public/img/superheroes/" + documents[0].image;
            if (fs.existsSync(dir)) {
                fs.unlink(dir, (err) => {
                    if (err) throw err;
                    console.log('successfully deleted images from folder superheroes');
                });
            }
        });

        //from command line we update an object collection with the following syntax
        //db.superheroes.updateOne({"name":"ANT MAN"}, { $set: { "name":"ANT MAN 1"} })
        let filter = { "_id": ObjectID(selectedId) };

        let updateObject = {
            "name": req.body.superhero.toUpperCase(),
        }

        if (req.file) {
            console.log("Updating image");
            updateObject.image = req.file.filename;
        }

        let update = {
            $set: updateObject
        };

        collection.updateOne(filter, update);

        client.close();
        res.redirect('/');
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});