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

//Declaring a global array called superheroes with three properties
const superheroes = [
    { id: 1, name: 'SPIDER-MAN', image: 'spiderman.jpg' },
    { id: 2, name: 'CAPTAIN MARVEL', image: 'captainmarvel.jpg' },
    { id: 3, name: 'Hulk', image: 'hulk.jpg' },
    { id: 4, name: 'Thor', image: 'thor.jpg' },
    { id: 5, name: 'IRON MAN', image: 'ironman.jpg' },
    { id: 6, name: 'DAREDEVIL', image: 'daredevil.jpg' },
    { id: 7, name: 'BLACK WIDOW', image: 'blackwidow.jpg' },
    { id: 8, name: 'CAPTAIN AMERICA', image: 'captanamerica.jpg' },
    { id: 9, name: 'WOLVERINE', image: 'wolverine.jpg' },
];

superheroes.reverse();

app.get('/', (req, res) => {
    //internal scope of this function
    const indexVariables = {
        pageTitle: "First page of our app",
        superheroes: superheroes
    }
    res.render('index', { variables: indexVariables });
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
    const selectedId = req.params.id;

    let selectedSuperhero = superheroes.filter(superhero => {
        console.log("Superhero: ", superhero.id, superhero.id === +selectedId);

        return superhero.id === +selectedId;
    });

    selectedSuperhero = selectedSuperhero[0];

    res.render('superhero', { superheroe: selectedSuperhero });
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