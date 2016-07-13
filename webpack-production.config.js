module.exports = [
	require("./make-webpack-config")({
		longTermCaching: false,
		prerender: false,
		minimize: true,
		uglify: false,
		separateStylesheet: true,
		devtool: "source-map"
	})
];
