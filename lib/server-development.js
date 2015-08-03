require("./server")({
	defaultPort: 8091,
	headers: { "Access-Control-Allow-Origin": "*" }
});