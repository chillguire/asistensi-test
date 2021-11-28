const express = require('express');
const router = express.Router();

const auth = require('../controller/auth');

const { validateBody } = require('../middleware/middleware');


router.route('/register')
	.post(validateBody, auth.create);

router.route('/login')
	.post(auth.login);


module.exports = router;