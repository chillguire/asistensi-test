const jwt = require('jsonwebtoken');
const { isValidObjectId } = require('mongoose');


module.exports.isLoggedIn = (req, res, next) => {
	const authorizationHeader = req.headers.authorization;
	const token = authorizationHeader && authorizationHeader.split(' ')[1];

	if (!token) {
		return res.status(401).send({ error: 'Not authorized' });
	}

	jwt.verify(token, process.env.SECRET || 'uwu', (error, user) => {
		if (error) {
			return res.status(401).send({ error: 'Not authorized' });
		}
		req.user = user;
		next();
	});
};

module.exports.isValidId = (req, res, next) => {
	if (!isValidObjectId(req.params.id)) {
		return res.status(400).send({ error: 'Bad request' });
	}
	next();
};