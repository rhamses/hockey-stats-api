const functions = require('firebase-functions');
const axios = require('axios');
const cors = require('cors')({origin: true});
const leaguesAPI = {
  nhl: 'https://records.nhl.com/site/api/player/byTeam',
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
      const teamID = request.query.team;
      
      let unit = 'imperial';
      let results = {};

      if (request.query.unit) {
        unit = request.query.unit;
      }

      switch (league) {
        case 'nhl':
          results = await axios.get(`${leaguesAPI[league]}/${teamID}`);
          results = results.data.data.map(result => { 
            return { 
              id: result.id, 
              image: `https://nhl.bamcontent.com/images/headshots/current/168x168/${result.id}.jpg`,
              fullName: result.fullName,
              sweaterNumber: result.sweaterNumber,
              position: result.position,
              team: teamID
            };
          });
        break;
        case 'ahl':
          const params = `?feed=statviewfeed&view=players&team=${teamID}&key=${leaguesAPI[league].key}&client_code=${league}`;
          results = await axios.get(leaguesAPI[league].url + params);
          results = JSON.parse(results.data.replace('([', '[').replace(/\)$/gmi, ''));
          results = results[0].sections[0].data.map(player => {
            const {
              player_id, 
              name,
              position
            } = player.row;

            return {
              id: player_id,
              image: `https://assets.leaguestat.com/ahl/240x240/${player_id}.jpg`,
              fullName: name,
              position,
              team: teamID
            }
          })
        break;
      }
      

      /*
      RESPONSE COMMAND
       */
      response.send(results);
    } catch(e) {
      console.log(e.message);
      response.send('An error occurred.', e.message);
    }
  })
});
