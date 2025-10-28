const _ = require('lodash');
const seasonRepo = require('../repositories/season');
const tableRepo = require("../repositories/table");
module.exports = {
  index: async (req, res)=> {
    const seasons = await seasonRepo.list();
    res.render('season', {
      title: 'Season',
      seasons
    });
  },
  create:async (req, res)=>{
    const { title } = req.body;
    await seasonRepo.create(title);
    res.redirect('/');
  },
  close:async (req, res)=>{
    const id = req.params.id;
    await seasonRepo.close(id);
    res.redirect('/season');
  },
};