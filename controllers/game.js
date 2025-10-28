const memberRepo = require("../repositories/member");
const tableRepo = require("../repositories/table");
const gameRepo = require("../repositories/game");
const requestRepo = require("../repositories/request");
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
    const table = await tableRepo.getById(id);
    res.render('game', {
      title: table.title + ' ' + table.member_name,
      table
    });
  },
  create:async (req, res)=>{
    const { member_id } = req.body;
    var title = `Bàn của `;
    const table =  await tableRepo.create(member_id, title);
    res.redirect(`/game/${table.id}`);
  },
  buyin:async (req, res)=>{
    const { member_id, table_id } = req.body;
    const hasRequest = await requestRepo.hasRequest(table_id, member_id);
    if (!hasRequest) {
      await requestRepo.request(table_id, member_id);
    }
    res.redirect(`/game/${table_id}?hasRequest=${hasRequest}`);
  },
  buyinProcess:async (req, res)=>{
    const { table_id, member_id, action } = req.body;
    const game = await gameRepo.findOrCreate(table_id, member_id);
    await gameRepo.updateRequest(game.id, game.buyin + 1);
    res.redirect(`/game/${table_id}}`);
  },
  membersInGame:async (req, res)=>{
    const tableId = req.params.id;
    const membersInGame = await gameRepo.getMembersInGame(tableId);
    res.json(membersInGame);
  },
  timeline:async (req, res)=>{
    const tableId = req.params.id;
    const timeline = await requestRepo.getTimelineByTable(tableId);
    res.json(timeline);
  }
};