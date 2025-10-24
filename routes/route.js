module.exports = (app) => {
  let home = require('../controllers/home')
  let game = require('../controllers/game')
  app.route('/').get(home.index);
  app.route('/login').get(home.login);
  app.route('/login').post(home.postLogin);
  app.route('/table').get(game.table);
  app.route('/table').post(game.store);
  app.route('/game').get(game.index);
  app.route('/game').get(game.index);
}