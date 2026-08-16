const INDEXNOW_HOST = "trend.franvia.com";
const INDEXNOW_KEY = "937c39f9bb3b44f1b15b50efe0fb66de";
const INDEXNOW_KEY_LOCATION = `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`;

export async function submitToIndexNow(urlList: string[]): Promise<Response> {
  return fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      host: INDEXNOW_HOST,
      key: INDEXNOW_KEY,
      keyLocation: INDEXNOW_KEY_LOCATION,
      urlList,
    }),
  });
}
