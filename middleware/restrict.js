module.exports = async (req, res, next)  => {
  let member = req.session.member
  if (member) {
    res.locals.member = member
    next();
  } else {
    res.redirect('/login');
  }
}