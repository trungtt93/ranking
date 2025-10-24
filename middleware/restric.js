module.exports = async (req, res, next)  => {
  let member = req.session.member
  if (member) {
    next();
  } else {
    res.redirect('/login');
  }
}