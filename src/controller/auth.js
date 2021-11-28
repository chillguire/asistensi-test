const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


module.exports.create = async (req, res) => {
	const { dni, phoneNumber, password, firstName, lastName, sex, status } = req.body;
	const payload = {
		service: 'Create user/Register',
	}

	// check whether req is appropiate
	if (!(dni && phoneNumber && password && firstName && lastName)) {
		payload.error = 'Missing args';
		return res.status(400).send(payload);
	}

	try {
		// check if resource already exists
		let user = await User.findOne({
			$or: [
				{ dni },
				{ phoneNumber }
			]
		});
		if (user) {
			payload.error = 'User with given credentials already exists';
			return res.status(409).send(payload);
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
				process.env.SECRET || 'uwu',
				{
					expiresIn: '7d',
				},
			);

			payload.token = token;
		}

		payload.id = user._id;
		return res.status(201).send(payload);
	} catch (error) {
		payload.error = error.message;

		console.log(error);
		return res.status(500).send(payload);
	}
};

module.exports.login = async (req, res) => {
	const identifier = req.body.user.trim();
	const password = req.body.password;
	const payload = {
		service: 'Login',
	}

	// check whether req is appropiate
	if (!(identifier && password)) {
		payload.error = 'Missing args';
		return res.status(400).send(payload);
	}

	try {
		const user = await User.findOne({
			$or: [
				{ dni: identifier },
				{ phoneNumber: identifier }
			]
		});
		const isPasswordCorrect = user === null ? false : await bcrypt.compare(password, user.password);

		if (!(user && isPasswordCorrect)) {
			payload.error = 'Invalid credentials';
			return res.status(401).send(payload);
		}

		const token = jwt.sign(
			{
				id: user._id,
			},
			process.env.SECRET || 'uwu',
			{
				expiresIn: '7d',
			},
		);

		return res.status(200).send({
			id: user._id,
			token,
		});
	} catch (error) {
		payload.error = error.message;

		console.log(error);
		return res.status(500).send(payload);
	}
};