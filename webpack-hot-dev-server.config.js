module.exports = require("./make-webpack-config")({
	devServer: true,
	hotComponents: false,
	devtool: "eval",
	debug: true,
	headers: { "Access-Control-Allow-Origin": "*" }
});
