const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema(
	{
		dni: {
			type: String,
			required: true,
			unique: true,
		},
		phoneNumber: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		firstName: {
			type: String,
			required: true,
		},
		lastName: {
			type: String,
			required: true,
		},
		sex: {
			type: String,
			enum: ['Male', 'Female', 'Other'],
			default: 'Other',
		},
		status: {
			type: String,
			enum: ['Active', 'Inactive', 'Pending'],
			default: 'Pending',
		},
	},
	{ timestamps: true },
);


module.exports = mongoose.model('User', userSchema);