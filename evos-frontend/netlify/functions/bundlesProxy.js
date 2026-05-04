export async function handler(event) {
  try {
    const { path, method = "GET", body } = JSON.parse(event.body || "{}");

    const API_KEY = process.env.BUNDLES_GHANA_API_KEY;
    const API_SECRET = process.env.BUNDLES_GHANA_API_SECRET;

    const url = `https://bundlesghana.store/api/v1${path}`;

    const res = await fetch(url, {
      method,
      headers: {
        "X-API-Key": API_KEY,
        "X-API-Secret": API_SECRET,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: method === "POST" ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();

    return {
      statusCode: res.status,
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
