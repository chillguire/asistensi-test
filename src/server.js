require('dotenv').config();

const express = require('express');
const app = express();
const http = require('http').Server(app);

const mongoose = require('mongoose');

const { isLoggedIn } = require('./middleware/middleware');
const AppError = require('./middleware/AppError');


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

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

app.all('*', isLoggedIn, (req, res) => {
	throw new AppError(404, 'Page not found');
});


//** ERROR HANDLING
app.use((error, req, res, next) => {
	console.log(error);
	const { status = 500, message = 'Something went wrong' } = error;
	res.status(status).send({ error: message });
});


//** APP.LISTEN
const port = process.env.PORT || 3000;
http.listen(port, () => {
	console.log(`Running: ${port}`);
});