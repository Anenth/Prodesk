import path from 'path';
import config from './config.js';

const srcPath = `${config.paths.assets}/${config.paths.jsSrc}`;
const distPath = `${config.paths.assets}/${config.paths.js}`;

module.exports = {
	entry: {
	  app: `${srcPath}/${config.js.entry[0]}`
	},
	output: {
		path: path.join(__dirname, distPath),
		publicPath: distPath,
		filename: '[name].bundle.js',
		chunkFilename: '[id].bundle.js'
	}
};