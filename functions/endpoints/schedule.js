const functions = require("firebase-functions");
const express = require("express");
const app = express();
const axios = require("axios");

function getTeam(games) {
  const schedule = [];
  for (const game of games) {
    const {
      status: { detailedState },
      teams: {
        away: {
          score: awayScore,
          team: { name: awayTeam },
        },
        home: {
          score: homeScore,
          team: { name: homeTeam },
        },
      },
    } = game;

    schedule.push({
      detailedState,
      teams: {
        away: awayTeam,
        home: homeTeam,
      },
      score: {
        away: awayScore,
        home: homeScore,
      },
    });
  }
  return schedule;
}

function formatGames(data) {
  const { dates } = data;
  let schedule = [];
  for (const dt of dates) {
    const { games } = dt;
    schedule = schedule.concat(getTeam(games));
  }
  return schedule;
}

app.get("/", async (req, res) => {
  try {
    const { startDate, endDate, league } = req.query;
    const params = { startDate, endDate };
    if (!league) throw new Error("League required");
    if (!startDate && !endDate)
      throw new Error("startDate and EndDate required");

    const { data } = await axios.get(
      "https://statsapi.web.nhl.com/api/v1/schedule",
      { params }
    );
    const schedule = formatGames(data);
    res.send(schedule);
  } catch (error) {
    console.log(error);
    const { message } = error;
    res.status(400).send({ message });
  }
});

module.exports = functions.https.onRequest(app);
