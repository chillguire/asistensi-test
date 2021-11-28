const jwt = require('jsonwebtoken');
const { isValidObjectId } = require('mongoose');

const AppError = require('../middleware/AppError');


module.exports.isLoggedIn = (req, res, next) => {
	const authorizationHeader = req.headers.authorization;
	const token = authorizationHeader && authorizationHeader.split(' ')[1];

	if (!token) {
		throw new AppError(401, 'Not authorized');
	}

	jwt.verify(token, process.env.SECRET, (error, user) => {
		if (error) {
			throw new AppError(401, 'Not authorized');
		}
		req.user = user;
		next();
	});
};

module.exports.isValidId = (req, res, next) => {
	if (!isValidObjectId(req.params.id)) {
		throw new AppError(400, 'Bad request');
	}
	next();
};