module.exports = [
	require("./make-webpack-config")({
		// commonsChunk: true,
		longTermCaching: true,
		separateStylesheet: true,
		minimize: true,
		uglify: false,
		devtool: "source-map"
	}),
	require("./make-webpack-config")({
		prerender: true,
		minimize: true,
		uglify: false
	})
];
