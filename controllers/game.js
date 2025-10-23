module.exports = {
  table:async (req, res)=>{
    res.render('table', { title: 'Table' });
  },
  index:async (req, res)=>{
    res.render('game', { title: 'Game' });
  },
};