const restrict = require('../middleware/restrict');
module.exports = (app) => {
  let home = require('../controllers/home')
  let game = require('../controllers/game')
  app.route('/login').get(home.login);
  app.route('/login').post(home.postLogin);
  app.route('/').get(restrict, home.index);
  app.route('/table').get(restrict, game.table);
  app.route('/table').post(restrict, game.store);
  app.route('/game').get(restrict, game.index);

  app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
  });
}