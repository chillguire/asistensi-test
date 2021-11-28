/**
 * listar usuarios: status pending, sexo masculino - ordenados por nombre (filtro en la ruta de listar usuarios?)
 */
const express = require('express');
const router = express.Router();

const { create } = require('../controller/auth');
const users = require('../controller/users');

const { isLoggedIn, isValidId } = require('../middleware/middleware');


router.route('/')
	.get(isLoggedIn, users.listUsers)
	.post(isLoggedIn, create);

router.route('/:id')
	.get(isValidId, isLoggedIn, users.viewUser)
	.put(isValidId, isLoggedIn, users.updateUser)
	.delete(isValidId, isLoggedIn, users.deleteUser);


module.exports = router;