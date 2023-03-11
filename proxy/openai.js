export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    url.hostname = "api.openai.com";
    const newRequest = new Request(url, request);
    return await fetch(newRequest);
  },
};
