const functions = require('firebase-functions');
const axios = require('axios');
const cors = require('cors')({origin: true});
const leaguesAPI = {
  nhl: 'https://statsapi.web.nhl.com/api/v1/people',
  ahl: {
    url: 'https://lscluster.hockeytech.com/feed/index.php',
    key: '50c2cd9b5e18e390'
  },
  echl: ''
};

exports = module.exports = functions.https.onRequest(async (request, response) => {
  cors(request, response, async () => {
    try {
      const league = request.query.league;
      const playerID = request.query.id;
      const season = request.query.season;

      let results = {};

      switch (league) {
        case 'nhl':
          results = await axios.get(`${leaguesAPI[league]}/${playerID}/stats?stats=statsSingleSeason&season=${season}`);

          if (results.status === 200) {
            if (results.data.stats[0].splits.length > 0) {
              results = results.data.stats[0].splits[0].stat;
            } else {
              results = {};
            }
          }
        break;
        case 'ahl':
          let seasonName;

          if (process.env.NODE_ENV !== 'production') {
            seasonName = await axios.get(`http://localhost:5001/hockey-stats-amb1/us-central1/seasons?league=${league}`);
            seasonName = seasonName.data.filter(s => s.id === season);
            seasonName = seasonName[0].name;
          } else {
            seasonName = await axios.get(`https://us-central1-hockey-stats-amb1.cloudfunctions.net/seasons?league=${league}`);
            seasonName = seasonName.data.filter(s => s.id === season);
            seasonName = seasonName[0].name;
          }

          const params = `?feed=statviewfeed&view=player&player_id=${playerID}&key=${leaguesAPI[league].key}&client_code=${league}`;
          stats = await axios.get(leaguesAPI[league].url + params);

          stats = JSON.parse(stats.data.replace('({', '{').replace(/\)$/gmi, ''));
          stats = stats.careerStats[0].sections[0].data.filter(st => st.row.season_name === seasonName);
          stats = stats[0].row;

          if (stats.goals) {
            results.goals = stats.goals;
          }

          if (stats.games_played) {
            results.games = stats.games_played;
          }

          if (stats.assists) {
            results.assists = stats.assists;
          }

          if (stats.points) {
            results.points = stats.points;
          }

          if (stats.plus_minus) {
            results.plusMinus = stats.plus_minus;
          }

          if (stats.penalty_minutes) {
            results.pim = stats.penalty_minutes;
          }

          if (stats.power_play_goals) {
            results.powerPlayGoals = stats.power_play_goals;
          }

          if (stats.shots) {
            results.shots = stats.shots;
          }

          if (stats.shooting_percentage) {
            results.shotPct = stats.shooting_percentage;
          }

          if (stats.game_winning_goals) {
            results.gameWinningGoals = stats.game_winning_goals;
          }

          if (stats.game_winning_goals) {
            results.gameWinningGoals = stats.game_winning_goals;
          }

          if (stats.wins) {
            results.wins = stats.wins;
          }

          if (stats.losses) {
            results.losses = stats.losses;
          }

          if (stats.ot_losses) {
            results.ot = stats.ot_losses;
          }

          if (stats.savepct) {
            results.savePercentage = stats.savepct;
          }

          if (stats.goals_against_average) {
            results.goalAgainstAverage = stats.goals_against_average;
          }

          if (stats.shutouts) {
            results.shutouts = stats.shutouts;
          }
          
        break;
      }
      response.send(results);
    } catch(e) {
      console.log(e.message);
      response.send('An error occurred.', e.message);
    }
  })
});
