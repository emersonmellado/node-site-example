const express = require('express');
const app = express();
const fs = require('fs');
const port = 3000;
//Mongoose implementation
const mongoose = require('mongoose');
let uri = "mongodb://node-site-example:node-site-example1234@cluster0-shard-00-00-1regk.mongodb.net:27017,cluster0-shard-00-01-1regk.mongodb.net:27017,cluster0-shard-00-02-1regk.mongodb.net:27017/comics?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//Mongoose Model (Work as a Schema)
const Superheroe = mongoose.model('Superheroe', {
    name: String,
    image: String
});

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
app.get('/update/:id', async (req, res) => {
    try {
        //internal scope of this function
        const selectedId = req.params.id;
        const document = await Superheroe.findById(selectedId).exec();
        res.render('update', { superheroe: document });
    } catch (err) {
        console.log("ERR: ", err)
    }
});
//delete endpoint
app.get('/delete/:id', async (req, res) => {
    //internal scope of this function
    const idToDelete = req.params.id;
    const document = await Superheroe.findById(idToDelete).exec();
    //Delete the image
    deleteImage(document.image);
    //Delete object from database
    await Superheroe.deleteOne({ _id: idToDelete }).exec();
    res.redirect('/');
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
app.post('/superheroUpdate/:id', upload.single('file'), async (req, res) => {
    try {
        const idToUpdate = req.params.id;

        //create the updateObject
        let updateObject = {
            "name": req.body.superhero.toUpperCase(),
        }
        //logic to handle the image
        if (req.file) {
            console.log("Updating image");
            updateObject.image = req.file.filename;
        }
        //call update on database
        let filter = { _id: idToUpdate };

        //find the document and put in memory
        const document = await Superheroe.findById(idToUpdate).exec();

        let result = await Superheroe.updateOne(filter, updateObject).exec();
        if (result.ok > 0 && req.file) {
            // delete the image 
            deleteImage(document.image);
        }
    } catch (err) {
        console.log("ERR: ", err);
    } finally {
        //redirect user to index
        res.redirect('/');
    }
});

function deleteImage(image){
    const dir = __dirname + "/public/img/superheroes/" + image;
    if (fs.existsSync(dir)) {
        fs.unlink(dir, (err) => {
            if (err) throw err;
            console.log('successfully deleted images from folder superheroes');
        });
    }
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});