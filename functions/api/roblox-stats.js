const ROBLOX_UNIVERSE_ID = "6502321499";
const ROBLOX_GROUP_ID = "34886490";

export async function onRequestGet() {
  try {
    const [gameResponse, groupResponse] = await Promise.all([
      fetch(`https://games.roblox.com/v1/games?universeIds=${ROBLOX_UNIVERSE_ID}`),
      fetch(`https://groups.roblox.com/v1/groups/${ROBLOX_GROUP_ID}`)
    ]);

    if (!gameResponse.ok || !groupResponse.ok) {
      throw new Error("Roblox returned an unsuccessful response");
    }

    const [gamePayload, group] = await Promise.all([
      gameResponse.json(),
      groupResponse.json()
    ]);
    const game = gamePayload.data?.[0];

    if (!game || !Number.isFinite(group.memberCount)) {
      throw new Error("Roblox returned incomplete statistics");
    }

    return Response.json(
      {
        visits: game.visits,
        favorites: game.favoritedCount,
        playing: game.playing,
        members: group.memberCount
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60"
        }
      }
    );
  } catch {
    return Response.json(
      { error: "Roblox statistics are temporarily unavailable" },
      { status: 502 }
    );
  }
}
