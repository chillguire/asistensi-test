const jwt = require('jsonwebtoken');


module.exports.isLoggedIn = function (req, res, next) {
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