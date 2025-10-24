const memberRepo = require("../repositories/member");
const tableRepo = require("../repositories/table");
const moment = require('moment');
module.exports = {
  table:async (req, res)=>{
    const members = await memberRepo.list();
    const tables = await tableRepo.list();
    res.render('table', {
      title: 'Table',
      members,
      tables
    });
  },
  index:async (req, res)=>{
    const id = req.params.id;
    const members = await memberRepo.list();
    const table = await tableRepo.getById(id);
    res.render('game', {
      title: table.title + ' ' + table.member_name,
      members,
      table
    });
  },
  create:async (req, res)=>{
    const { member_id } = req.body;
    var title = `Bàn của `;
    const table =  await tableRepo.create(member_id, title);
    res.redirect(`/game/${table.id}`);
  },
};