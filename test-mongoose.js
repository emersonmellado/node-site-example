const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/comics', {useNewUrlParser: true, useUnifiedTopology: true});

const Superheroe = mongoose.model('Superheroe', { 
    name: String,
    image: String
});

const superheroe = new Superheroe({ name: 'Hulk', image: 'hulk.jpg' });

superheroe.save().then(() => console.log('New hero added'));