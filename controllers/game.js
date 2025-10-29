const _ = require('lodash');
const memberRepo = require("../repositories/member");
const tableRepo = require("../repositories/table");
const gameRepo = require("../repositories/game");
const requestRepo = require("../repositories/request");
const seasonRepo = require("../repositories/season");
module.exports = {
  table:async (req, res)=>{
    const seasonId = req.query.season || null
    const season = await seasonRepo.season(seasonId);
    const members = await memberRepo.list();
    const tables = await tableRepo.list(season.id);
    res.render('table', {
      title: 'Table',
      members,
      tables,
      season
    });
  },
  index:async (req, res)=>{
    const id = req.params.id;
    const table = await tableRepo.getById(id);
    const seasonMembers = await seasonRepo.seasonMembers(table.season_id);
    const membersFee = _.map(seasonMembers, v => {
      let fee = 0.1;
      if (v.amount >= 500) fee = 0.2;
      else if (v.amount >= 400) fee = 0.15;
      else if (v.amount <= -300) fee = 0;
      return { member_id: v.member_id, fee, amount: v.amount };
    });

    for (const member of membersFee) {
      const existingGame = await gameRepo.find(id, member.member_id); // tableId, memberId
      if (!existingGame) {
        await gameRepo.createFee({
          table_id: id,
          member_id: member.member_id,
          fee: member.fee,
          prev_amount: member.amount
        });
      }
    }
    res.render('game', {
      title: table.title + ' ' + table.member_name,
      table
    });
  },
  create:async (req, res)=>{
    const season = await seasonRepo.season();
    const { member_id } = req.body;
    var title = `Bàn của `;
    const table =  await tableRepo.create(season.id, member_id, title);
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
    await gameRepo.updateRequest(table_id, member_id, action);
    res.json({ success: true });
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
  },
  cashback:async (req, res)=>{
    const {list, total, member_id, table_id} = req.body;
    await requestRepo.cashback(list, total, member_id, table_id);
    res.redirect(`/game/${table_id}`);
  },
  cashbackProcess:async (req, res)=>{
    const { table_id, member_id, action } = req.body;
    await gameRepo.updateCashback(table_id, member_id, action);
    if (action === 'approved') {
      await module.exports.applyCashback(table_id, member_id);
    }
    res.json({ success: true });
  },
  applyCashback:async (tableId, memberId)=>{
    const table = await tableRepo.getById(tableId);
    const seasonMembers = await seasonRepo.seasonMembers(table.season_id);
    const game = await gameRepo.find(tableId, memberId);
    const membersFee = _.map(seasonMembers, v => {
      let fee = 0.1;
      if (v.amount >= 500) fee = 0.2;
      else if (v.amount >= 400) fee = 0.15;
      else if (v.amount <= -300) fee = 0;
      return { member_id: v.member_id, fee, amount: v.amount};
    });

    let total = game.buyin * 50
    let before = game.cashback - total
    let feeData = _.find(membersFee, { member_id: Number(memberId) });

    let feeValue = (feeData.fee > 0 && before > 0) ? Math.ceil(before * feeData.fee) : 0;
    let after = before - feeValue;
    let feeAmount = before + feeData.amount
    if (feeData.fee == 0 && feeAmount > 0) {
      feeValue =  Math.ceil(feeAmount * 0.1);
      after = before - feeValue;
    }
    await gameRepo.updateCashbackAndSeason(tableId, memberId, table.season_id, {
      total,
      feeValue: feeValue,
      amount: feeData.amount + after
    });
  },
};