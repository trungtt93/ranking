const _ = require('lodash');
const memberRepo = require('../repositories/member');
module.exports = {
  index: async (req, res)=> {
    const members = await memberRepo.getAllMembers();
    const top = _.take(members,3)
    res.render('index', {
      title: 'Ranking',
      members,
      top
    });
  },
  login: (req, res)=> {
    res.render('login', {
      title: 'Login',
      layout: 'layouts/blank'
    });
  },
  postLogin: async (req, res)=> {
    const { username, password } = req.body;
    const member = await memberRepo.login(username, password);
    if (!member) {
      return res.render('login', {
        title: 'Login',
        layout: 'layouts/blank',
        error: 'Không phải thành viên, CÚT'
      });
    }
    req.session.member = member;
    res.redirect('/');
  }
};