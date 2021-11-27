const express = require('express');
const app = express();
const http = require('http').Server(app);

const mongoose = require('mongoose');

const { isLoggedIn } = require('./middleware/middleware');


//** DB CONFIG
const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/asistensi-test-db';
mongoose.connect(dbURL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log('DB connected');
});


//** APP CONFIG
//? general
app.use(express.urlencoded({ extended: false, }));
app.use(express.json());


//** ROUTES
const authRoutes = require('./routes/auth');
app.use('/api/', authRoutes);

app.all('*', isLoggedIn, (req, res) => {
	res.sendStatus(404);
});


//** APP.LISTEN
const port = process.env.PORT || 3000;
http.listen(port, () => {
	console.log(`Running: ${port}`);
});