module.exports = require("./make-webpack-config")({
	devServer: true,
	devtool: "eval",
	debug: true,
	headers: { "Access-Control-Allow-Origin": "*" }
});
