const functions = require("firebase-functions");
const axios = require("axios");
const cors = require("cors")({ origin: true });
const leaguesAPI = {
  nhl: "https://statsapi.web.nhl.com/api/v1/seasons",
  ahl: {
    url: "https://lscluster.hockeytech.com/feed/index.php",
    key: "50c2cd9b5e18e390",
  },
  echl: "https://www.echl.com/api/s3?q=teams.json",
};

exports = module.exports = functions.https.onRequest(
  async (request, response) => {
    cors(request, response, async () => {
      try {
        const league = request.query.league;
        let results = {};
        switch (league) {
          case "nhl":
            results = await axios.get(`${leaguesAPI[league]}`);
            results = results.data.seasons.map((season) => {
              return {
                startAt: season.regularSeasonStartDate,
                endedAt: season.regularSeasonEndDate,
                id: season.seasonId,
                games: season.numberOfGames,
              };
            });
            break;
          case "ahl":
            const params = `?feed=statviewfeed&view=bootstrap&key=${leaguesAPI[league].key}&client_code=${league}`;
            results = await axios.get(leaguesAPI[league].url + params);
            results = JSON.parse(
              results.data.replace("({", "{").replace(/\)$/gim, "")
            );
            results = results.regularSeasons.map((season) => {
              const seasonName = season.name
                .replace("-", "-20")
                .replace(/\D/gim, "");
              return {
                id: season.id,
                years: seasonName,
                name: season.name,
              };
            });
            break;
        }

        response.send(results);
      } catch (e) {
        console.log(e);
        response.status(400).send("An error occurred.", e);
      }
    });
  }
);
