const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializingServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started...");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
  }
};
initializingServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
///GET Method
app.get("/players/", async (request, response) => {
  const allPlayers = `SELECT * FROM cricket_team;`;
  const result = await db.all(allPlayers);
  response.send(
    result.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

///POST Method
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `INSERT INTO cricket_team
  (player_name,jersey_number,role)VALUES
  (
  '${playerName}',
  ${jerseyNumber},
  '${role}'
  );`;
  const dbResponse = await db.run(addPlayerQuery);
  const PlayerId = dbResponse.lastID;
  response.send("Player Added to Team");
});
///GET Method With Specific-ID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const gettingPlayerById = `SELECT * FROM cricket_team WHERE player_id=${playerId};`;
  const playerResult = await db.get(gettingPlayerById);
  response.send(convertDbObjectToResponseObject(playerResult));
});
///updating the col from specific id
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updateQueryPlayer = `UPDATE cricket_team SET 
    player_name='${playerName}',
    jersey_number=${jerseyNumber},
    role='${role}' WHERE player_id=${playerId};`;
  await db.run(updateQueryPlayer);
  response.send(`Player Details Updated`);
});
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id=${playerId};`;
  await db.run(deletePlayerQuery);
  response.send(`Player Removed`);
});
module.exports = app;
