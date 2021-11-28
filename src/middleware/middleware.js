const jwt = require('jsonwebtoken');
const { isValidObjectId } = require('mongoose');
const Joi = require('joi');

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

const userSchema = Joi.object({
	firstName: Joi.string().min(3).max(30).trim(),
	lastName: Joi.string().min(3).max(30).trim(),
	dni: Joi.string().length(9).pattern(new RegExp('^[0-9]{8,8}[A-Za-z]$')),
	phoneNumber: Joi.string().min(8).max(15).pattern(/^[0-9]+$/),
	password: Joi.string().min(1),
	sex: Joi.string().valid('Male', 'Female', 'Other'),
	status: Joi.string().valid('Active', 'Inactive', 'Pending'),
});
module.exports.validateBody = (req, res, next) => {
	const { error } = userSchema.validate(req.body, { abortEarly: false });
	if (error) {
		const messages = error.details.map(element => element.message).join(', ');
		throw new AppError(400, messages);
	}
	next();
};