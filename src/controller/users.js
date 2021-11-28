const User = require('../models/user');

//* FILTRO CON AGGREGATE AQUI.
//? status pending, sex male, order by firstName
module.exports.listUsers = async (req, res) => {
	try {
		const users = await User.find({});
		return res.status(200).send(users);
	} catch (error) {
		console.log(error);
		return res.status(500).send({ error: error.message });
	}
};

module.exports.viewUser = async (req, res) => {
	try {
		const user = await User.findOne({ _id: req.params.id });
		if (!user) {
			return res.status(404).send({ error: 'User does not exists' });
		}
		return res.status(200).send(user);
	} catch (error) {
		console.log(error);
		return res.status(500).send({ error: error.message });
	}
};

module.exports.deleteUser = async (req, res) => {
	try {
		const user = await User.findOneAndDelete({ _id: req.params.id });
		if (!user) {
			return res.status(404).send({ error: 'User does not exists' });
		}
		return res.status(204).end();
	} catch (error) {
		console.log(error);
		return res.status(500).send({ error: error.message });
	}
};

module.exports.updateUser = async (req, res) => {
	try {
		let user = await User.findOne({ _id: req.params.id });
		if (!user) {
			return res.status(404).send({ error: 'User does not exists' });
		}

		const forbiddenData = ['_id', "__v", "createdAt", "updatedAt"];
		const updatedData = Object.keys(user._doc).reduce((diff, key) => {
			if ((user[key] !== req.body[key]) && req.body[key] && user[key] && !forbiddenData.includes(key)) {
				diff[key] = req.body[key];
			}
			return diff;
		}, {});

		if (Object.keys(updatedData).length !== 0) {
			// if dni or phoneNumber is changed, check that it is not registered already
			if ((updatedData.dni || updatedData.phoneNumber)) {
				const userExists = await User.findOne({
					$or: [
						{ dni: updatedData.dni },
						{ phoneNumber: updatedData.phoneNumber }
					]
				});

				if (userExists) {
					return res.status(409).send({ error: 'User with given credentials already exists' });
				}
			}

			user = await User.findByIdAndUpdate({ _id: req.params.id }, updatedData, { new: true, runValidators: true });
			return res.status(200).send(user);
		} else {
			return res.status(204).end();
		}

	} catch (error) {
		console.log(error);
		return res.status(500).send({ error: error.message });
	}
};