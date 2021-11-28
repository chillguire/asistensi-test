const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const AppError = require('../middleware/AppError');
const errorHandling = require('../middleware/errorHandling');


module.exports.create = errorHandling.catchAsyncError(async (req, res) => {
	const { dni, phoneNumber, password, firstName, lastName, sex, status } = req.body;
	const payload = {}

	// check whether req is appropiate
	if (!(dni && phoneNumber && password && firstName && lastName)) {
		throw new AppError(400, 'Missing args');
	}

	// check if resource already exists
	let user = await User.findOne({
		$or: [
			{ dni },
			{ phoneNumber }
		]
	});
	if (user) {
		throw new AppError(409, 'User with given credentials already exists');
	}

	const hashedPassword = await bcrypt.hash(password, 10);
	user = new User({
		dni,
		phoneNumber,
		password: hashedPassword,
		firstName,
		lastName,
		sex,
		status,
	});
	await user.save();

	if (!req.user) {
		const token = jwt.sign(
			{
				id: user._id,
			},
			process.env.SECRET,
			{
				expiresIn: '7d',
			},
		);

		payload.token = token;
	}

	payload.id = user._id;
	return res.status(201).send(payload);
});

module.exports.login = errorHandling.catchAsyncError(async (req, res) => {
	const identifier = req.body.user;
	const password = req.body.password;

	// check whether req is appropiate
	if (!(identifier && password)) {
		throw new AppError(400, 'Missing args');
	}

	const user = await User.findOne({
		$or: [
			{ dni: identifier },
			{ phoneNumber: identifier }
		]
	}).select('password');
	const isPasswordCorrect = user === null ? false : await bcrypt.compare(password, user.password);

	if (!(user && isPasswordCorrect)) {
		throw new AppError(401, 'Invalid credentials');
	}

	const token = jwt.sign(
		{
			id: user._id,
		},
		process.env.SECRET,
		{
			expiresIn: '7d',
		},
	);

	return res.status(200).send({
		id: user._id,
		token,
	});
});