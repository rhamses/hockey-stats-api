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
      
      let unit = 'imperial';
      let results = {};

      if (request.query.unit) {
        unit = request.query.unit;
      }

      switch (league) {
        case 'nhl':
          results = await axios.get(`${leaguesAPI[league]}/${playerID}`);

          const player = results.data.people[0];

          results = { 
            id:  player.id, 
            image: `https://nhl.bamcontent.com/images/headshots/current/168x168/${playerID}.jpg`,
            fullName: player.fullName, 
            firstName: player.firstName,
            lastName: player.lastName,
            birthDate: player.birthDate,
            nationality: player.nationality,
            height: player.height, 
            weight: player.weight,
            sweaterNumber: player.sweaterNumber,
            primaryNumber: player.primaryNumber,
            position: player.primaryPosition.code,
            shootsCatches: player.shootsCatches,
            nhlExperience: player.nhlExperience,
            yearsPro: player.yearsPro,
            currentAge: player.currentAge,
            isRookie: player.isRookie,
            isSuspended: player.isSuspended,
            isRetired: player.isRetired,
            isJunior: player.isJunior,
            alternateCaptain: player.alternateCaptain,
            captain: player.captain,
            rookie: player.rookie
          };

        break;
        case 'ahl':
          const params = `?feed=statviewfeed&view=player&player_id=${playerID}&key=${leaguesAPI[league].key}&client_code=${league}`;
          results = await axios.get(leaguesAPI[league].url + params);
          results = JSON.parse(results.data.replace('({', '{').replace(/\)$/gmi, ''));

          const infos = results.info;

          results = {
            id: infos.playerId, 
            image: infos.profileImage,
            fullName: (infos.firstName + ' ' + infos.lastName),
            firstName: infos.firstName,
            lastName: infos.lastName,
            birthDate:  infos.birthDate,
            height: infos.height, 
            weight: infos.weight,
            sweaterNumber: infos.jerseyNumber,
            primaryNumber: infos.jerseyNumber,
            position: infos.position,
            shootsCatches: infos.shoots,
            currentAge: (new Date().getFullYear() - new Date(infos.birthDate).getFullYear())
          };

        break;
      }
      
        response.send(results);
      } catch(e) {
        console.log(e.message);
        response.send('An error occurred.', e.message);
      }
    })
});
