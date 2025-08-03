import { getSpotifyAccessToken } from "../../src/service/spotify";

export async function handler(event, context) {
  const SPOTIFY_CLIENT_ID = process.env.VITE_SPOTIFY_CLIENT_ID;
  const SPOTIFY_SECRET = process.env.NETLIFY_SPOTIFY_SECRET;

  console.log("Loaded clientId:", SPOTIFY_CLIENT_ID ? "Yes" : "No");
  console.log("Loaded clientSecret:", SPOTIFY_SECRET ? "Yes" : "No");

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_SECRET) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing Spotify credentials" }),
    };
  }

  const token = await getSpotifyAccessToken(SPOTIFY_CLIENT_ID, SPOTIFY_SECRET);

  return {
    statusCode: 200,
    body: JSON.stringify({ access_token: token }),
  };
}
