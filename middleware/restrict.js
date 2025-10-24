module.exports = async (req, res, next)  => {
  let member = req.session.member
  if (member) {
    res.locals.member = member
    res.locals.currentPath = req.path
    next();
  } else {
    res.redirect('/login');
  }
}