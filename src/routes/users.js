const express = require('express');
const router = express.Router();

const { create } = require('../controller/auth');
const users = require('../controller/users');

const { isLoggedIn, isValidId, validateBody } = require('../middleware/middleware');


router.route('/')
	.get(isLoggedIn, users.listUsers)
	.post(isLoggedIn, validateBody, create);

router.route('/:id')
	.get(isValidId, isLoggedIn, users.viewUser)
	.put(isValidId, isLoggedIn, validateBody, users.updateUser)
	.delete(isValidId, isLoggedIn, users.deleteUser);


module.exports = router;