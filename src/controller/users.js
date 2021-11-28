const User = require('../models/user');

const AppError = require('../middleware/AppError');
const errorHandling = require('../middleware/errorHandling');


module.exports.listUsers = errorHandling.catchAsyncError(async (req, res) => {
	let users;
	if (req.query.hasOwnProperty('sex') || req.query.hasOwnProperty('status')) {
		const sexList = ['Male', 'Female', 'Other'];
		const statusList = ['Active', 'Inactive', 'Pending'];
		const sex = (sexList.includes(req.query.sex)) ? req.query.sex : 'Male';
		const status = (statusList.includes(req.query.status)) ? req.query.status : 'Pending';

		users = await User.aggregate([
			{ $match: { sex, status } },
			{ $sort: { firstName: 1, lastName: 1 } }
		]);
	} else {
		users = await User.find({});
	}

	return res.status(200).send(users);
});

module.exports.viewUser = errorHandling.catchAsyncError(async (req, res) => {
	const user = await User.findOne({ _id: req.params.id });
	if (!user) {
		throw new AppError(404, 'User does not exists');
	}
	return res.status(200).send(user);
});

module.exports.deleteUser = errorHandling.catchAsyncError(async (req, res) => {
	const user = await User.findOneAndDelete({ _id: req.params.id });
	if (!user) {
		throw new AppError(404, 'User does not exists');
	}
	return res.status(204).end();
});

module.exports.updateUser = errorHandling.catchAsyncError(async (req, res) => {
	let user = await User.findOne({ _id: req.params.id });
	if (!user) {
		throw new AppError(404, 'User does not exists');
	}

	const forbiddenData = ['_id', "__v", "createdAt", "updatedAt"];
	const updatedData = Object.keys(user._doc).reduce((diff, key) => {
		if ((user[key] !== req.body[key]) && req.body[key] && user[key] && !forbiddenData.includes(key)) {
			diff[key] = req.body[key];
		}
		return diff;
	}, {});

	if (Object.keys(updatedData).length > 0) {
		// if dni or phoneNumber is changed, check that it is not registered already
		if ((updatedData.dni || updatedData.phoneNumber)) {
			const userExists = await User.findOne({
				$or: [
					{ dni: updatedData.dni },
					{ phoneNumber: updatedData.phoneNumber }
				]
			});

			if (userExists) {
				throw new AppError(409, 'User with given credentials already exists');
			}
		}

		user = await User.findByIdAndUpdate({ _id: req.params.id }, updatedData, { new: true, runValidators: true });
		return res.status(200).send(user);
	} else {
		return res.status(204).end();
	}
});