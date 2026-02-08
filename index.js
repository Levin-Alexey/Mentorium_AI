export default {
	async fetch() {
		return new Response("Привет, я бот", {
			headers: {
				"content-type": "text/plain; charset=utf-8",
			},
		});
	},
};
