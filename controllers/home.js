const _ = require('lodash');
const memberRepo = require('../repositories/member');
module.exports = {
  index: async (req, res)=>{
    const members = await memberRepo.getAllMembers();
    const top = _.take(members,3)
    res.render('index', {
      title: 'Ranking',
      members,
      top
    });
  }
};