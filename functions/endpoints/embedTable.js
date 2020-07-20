const functions = require('firebase-functions');
const axios = require('axios');
const cors = require('cors')({origin: true});

let leaguesAPI = {
  player: 'http://localhost:5001/hockey-stats-amb1/us-central1/player',
  stats: 'http://localhost:5001/hockey-stats-amb1/us-central1/playerStats'
};

exports = module.exports = functions.https.onRequest(async (request, response) => {

  let leaguesAPI = {};
  
  if (process.env.NODE_ENV !== 'production') {
    leaguesAPI = {
      player: 'http://localhost:5001/hockey-stats-amb1/us-central1/player',
      stats: 'http://localhost:5001/hockey-stats-amb1/us-central1/playerStats'
    };
  } else {
    leaguesAPI = {
      player: 'https://us-central1-hockey-stats-amb1.cloudfunctions.net/player',
      stats: 'https://us-central1-hockey-stats-amb1.cloudfunctions.net/playerStats'
    };
  }
  cors(request, response, async () => {
    try {
      const {league, player, season} = JSON.parse(Buffer.from(request.query.code, 'base64').toString('ascii'));

      let playerDetail = await axios.get(`${leaguesAPI.player}?league=${league}&id=${player}`);
      let playerStats = await axios.get(`${leaguesAPI.stats}?league=${league}&id=${player}&season=${season}`);
      let table = '';

      playerDetail = playerDetail.data;
      playerStats = playerStats.data;

      if (playerDetail.position === 'G') {
        table = `<table v-else class="player__stats--table widefat" border="0" cellpadding="0" cellspacing="0">
            <tbody>
              <tr>
                <th class="cell--image" rowspan="3" width="240">
                  <a target="_new" href="#">
                    <figure class="player__image">
                      <img alt="'Headshot of' + ${playerDetail.fullName}" src="${playerDetail.image}">
                    </figure>
                  </a>
                </th>
                <th title="Total de Jogos">GP</th>
                <th title="Total de Vitórias">W</th>
                <th title="Total de Derrotas">L</th>
                <th title="Total de Shutouts">Sh</th>
                <th title="Média de Gols sofridos">GAA</th>
                <th title="Porcentagem de Defesas">SV%</th>
              </tr>
              <tr>
                <td title="Total de Jogos">${playerStats.games}</td>
                <td title="Total de Vitórias">${playerStats.wins}</td>
                <td title="Total de Derrotas">${playerStats.losses}</td>
                <td title="Total de Shutouts">${playerStats.shutouts}</td>
                <td title="Média de Gols sofridos">${playerStats.goalAgainstAverage}</td>
                <td title="Porcentagem de Defesas">${playerStats.savePercentage}</td>
              </tr>
            </tbody>
          </table>`;
      } else {
        table = `<table class="player__stats--table widefat" border="0" cellpadding="0" cellspacing="0">
            <tbody>
              <tr>
                <th class="cell--image" rowspan="3" width="240">
                  <a target="_new" href="#">
                    <figure class="player__image">
                      <img alt="'Headshot of' + ${playerDetail.fullName}" src="${playerDetail.image}">
                    </figure>
                  </a>
                </th>
                <th title="Total de Jogos">GP</th>
                <th title="Total de Pontos">PTS</th>
                <th title="Total de Gols">G</th>
                <th title="Total de Assistências">A</th>
                <th title="Total de Mais/Menos">+/-</th>
                <th title="Tempo ativamente no gelo">TOI</th>
                <th title="Tempo total de penalidades">PIM</th>
                <th title="Total de disparos ao gol">SHT</th>
                <th title="Total de jogadas físicas contra o oponente">HIT</th>
                <th title="Total de Gols decisivos">GWG</th>
                <th title="Percentagem de disparos ao gol">SH%</th>
              </tr>
              <tr>
                <td title="Total de Jogos">${playerStats.games}</td>
                <td title="Total de Pontos">${playerStats.points}</td>
                <td title="Total de Gols">${playerStats.goals}</td>
                <td title="Total de Assistências">${playerStats.assists}</td>
                <td title="Total de Mais/Menos">${playerStats.plusMinus}</td>
                <td title="Tempo ativamente no gelo">${playerStats.timeOnIce}</td>
                <td title="Tempo total de penalidades">${playerStats.pim}</td>
                <td title="Total de disparos ao gol">${playerStats.shots}</td>
                <td title="Total de jogadas físicas contra o oponente">${playerStats.hits}</td>
                <td title="Total de Gols decisivos">${playerStats.gameWinningGoals}</td>
                <td title="Percentagem de disparos ao gol">${playerStats.shotPct}</td>
              </tr>
            </tbody>
          </table>`;
      }

      const html = `
      <div class="player--wrapper">
        <h3 class="player__title title">
          #${playerDetail.primaryNumber} ${playerDetail.fullName} 
          ${playerDetail.captain ? '<small>(C)</small>' : ''}
          ${playerDetail.rookie ? '<small>(Rookie)</small>' : ''}
          ${playerDetail.alternateCaptain ? '<small>(A)</small>' : ''}
        </h3>
        <p class="player__title--complementary">
          <span><b>Idade: </b>${playerDetail.currentAge}</span>
          <span><b>Altura: </b>${playerDetail.height}<small>ft</small></span>
          <span><b>Peso: </b>${playerDetail.weight}<small>lbs</small></span>
          <span><b>Mão dominante: </b>
            ${playerDetail.shootsCatches === 'L' ? 'Canhoto' : 'Destro'}
          </span>
        </p>
        <div class="player__stats--table--wrapper mt-5">
          ${table}
        </div>
      </div>
      

      <style>
  /*
  Overall Table Styles
  */

  .player--wrapper {
    max-width: 900px;
    margin: 0 auto;
    padding-top: 0;
  }

  .player--wrapper .player__title--complementary {
    display: flex;
  }

  .player--wrapper .player__title--complementary span {
    display: inline-block;
    padding-left: .5em;
    padding-right: .5em;
    position: relative;
  }

  .player--wrapper .player__title--complementary span::after {
    content: '';
    display: block;
    height: 70%;
    position: absolute;
    left: 100%;
    top: 15%;
    width: 1px;

    background-color: #000;
  }

  .player--wrapper .player__title--complementary span:first-child {
    padding-left: 0;
  }

  .player--wrapper .player__title--complementary span:last-child::after {
    content: none;
  }

  .player--wrapper .player__image {
    margin: 0;
    padding: 0;
  }

  .player--wrapper .player__image img {
    display: block;
  }

/*
  Player Table Responsive
  */

  .player--wrapper .player__stats--table--wrapper {
    overflow: scroll;
    position: relative;
    width: 100%;

    outline: #efefef;
  }

  @media screen and (max-width: 1024px) {
    .player--wrapper .player__title--complementary span {
      display: block;
      padding-left: 0;
    }

    .player--wrapper .player__title--complementary span::after {
      content: none;
    }
  }

/*
  Player Table
  */


  .player__stats--table {
    width: 100%;
  }

  .player--wrapper .player__stats--table th,
  .player--wrapper .player__stats--table td {
    width: 66px;

    border: 1px solid #e6e6e6;  
    text-align: center;
    vertical-align: middle;
  }

  .player--wrapper .player__stats--table th {
    font-weight: bold;
    background-color: #f9f9f9;
  }

  .player--wrapper .player__stats--table th.cell--image {
    padding: 0;
    margin: 0;
    width: 168px;

    background-color: #fff;
  }

/*
  Legend Box
  */

  .player__stats--legend__list {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 1em;
  }

  .player__stats--legend--wrapper {
    font-size: 16px;
  }

  .player__stats--legend--wrapper .showLegend {
    padding: .5em;

    font-variant: small-caps;
    text-transform: lowercase;
  }

  .player__stats--legend__list {
    margin: 0;
    padding: 1em;
    width: 100%;

    background-color: #f9f9f9;
    border: solid 1px #efefef;
  }

  .player__stats--legend__list dt, 
  .player__stats--legend__list dd {
    margin: 0;
    line-height: 2.5;
  }

  .player__stats--legend__list dt {
    flex-basis: 10%;
  }

  .player__stats--legend__list dd {
    flex-basis: 40%;
  }

  @media screen and (max-width: 1024px) {
    .player__stats--legend__list dt {
      flex-basis: 30%;
    }

    .player__stats--legend__list dd {
      flex-basis: 70%;
    }
  }


  </style>
`;

      // console.log(resultos)
      response.send(html);
    } catch(e) {
      console.log(e.message);
      response.send('An error occurred.', e.message);
    }
  })
});
