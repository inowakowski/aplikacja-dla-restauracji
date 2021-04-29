const _ = require('lodash');
const noEnvFile = process.env.NO_ENVFILE;

if (_.isNil(noEnvFile)) {
	require('dotenv').config();
}

console.log(process.env);

// module.exports = {
// 	username: process.env.DB_USERNAME,
// 	password: process.env.DB_PASSWORD,
// 	host: process.env.DB_HOST,
// 	database: process.env.DB_NAME,
// 	port: process.env.DB_PORT,
// 	dialect: process.env.DB_DIALECT,
// 	native: true,
// };