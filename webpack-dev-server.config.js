module.exports = require("./make-webpack-config")({
	devServer: true,
	debug: true,
	devTool: 'sourcemap',
	minimize: true,
	separateStylesheet: true
});
