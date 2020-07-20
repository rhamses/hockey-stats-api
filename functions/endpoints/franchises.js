const functions = require('firebase-functions');
const axios = require('axios');
const cors = require('cors')({origin: true});
const leaguesAPI = {
  nhl: 'https://records.nhl.com/site/api/franchise',
  ahl: {
    url: 'https://lscluster.hockeytech.com/feed/index.php',
    key: '50c2cd9b5e18e390'
  },
  echl: 'https://www.echl.com/api/s3?q=teams.json'
};

exports = module.exports = functions.https.onRequest(async (request, response) => {
  cors(request, response, async () => {
    try {
      const league = request.query.league;
      let results = '';

      if (league === 'nhl') {
        results = await axios.get(leaguesAPI[league]);
        results = results.data.data.map(result => {
          return {
            "id": result.mostRecentTeamId,
            "teamName": result.teamCommonName,
            "teamCity": result.teamPlaceName
          }
        })
      }

      if(league === 'echl') {
        results = await axios.get(leaguesAPI[league]);
        results = results.data.data.map(team => {
          let teamCity;
          if (team.name.toLowerCase().includes('san')) {
            teamCity = team.name.split(" ")[0] + ' ' + team.name.split(" ")[1];
          } else {
            teamCity = team.name.split(" ")[0]
          }
          const teamName = team.name.replace(teamCity, '').trim();
          return {
            "id": team.externalId,
            teamName,
            teamCity,
            "logo": team.logo.url
          }
        })
      }

      if(league === 'ahl') {
        const params = `?feed=statviewfeed&view=bootstrap&key=${leaguesAPI[league].key}&client_code=${league}`;
        results = await axios.get(leaguesAPI[league].url + params);
        results = JSON.parse(results.data.replace('({', '{').replace(/\)$/gmi, ''));
        results = results.teams.map(team => {
          if (team.id > 0 ) {
            let teamCity;
            if (team.name.toLowerCase().includes('san')) {
              teamCity = team.name.split(" ")[0] + ' ' + team.name.split(" ")[1];
            } else {
              teamCity = team.name.split(" ")[0]
            }
            const teamName = team.name.replace(teamCity, '').trim();
            return {
              "id": team.id,
              teamName,
              teamCity,
              "logo": team.logo
            }
          }
        })
      }

      /*
      RESPONSE BODY
       */
      response.send(results);
    } catch(e) {
      console.log(e);
      response.send('An error occurred.', e.message);
    }
  });
});
