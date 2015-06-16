require("./server")({
	defaultPort: 8081,
	headers: { "Access-Control-Allow-Origin": "*" }
});