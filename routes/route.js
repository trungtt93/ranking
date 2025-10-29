const restrict = require('../middleware/restrict');
module.exports = (app) => {
  let home = require('../controllers/home')
  let game = require('../controllers/game')
  let season = require('../controllers/season')
  app.route('/login').get(home.login);
  app.route('/login').post(home.postLogin);
  app.route('/').get(restrict, home.index);
  app.route('/season').get(restrict, season.index);
  app.route('/season').post(restrict, season.create);
  app.route('/season/:id/close').post(restrict, season.close);
  app.route('/table').get(restrict, game.table);
  app.route('/table').post(restrict, game.create);
  app.route('/game/:id').get(restrict, game.index);
  app.route('/buyin').post(restrict, game.buyin);
  app.route('/cashback').post(restrict, game.cashback);

  app.route('/api/game/:id/members').get(game.membersInGame);
  app.route('/api/game/:id/timeline').get(game.timeline);
  app.route('/api/game/buyin/process').post(game.buyinProcess);
  app.route('/api/game/cashback/process').post(game.cashbackProcess);
  app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
  });
}