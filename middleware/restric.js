module.exports = async (req, res, next)  => {
  let reqToken = req.headers['authorization'];
  if (reqToken) {
    try {
     //Todo
      next();
    }catch (e) {
      logger.error(ref, "Unauthorized: " + reqToken);
      res.status(401).json({ 'status': 'error', 'message': 'Unauthorized.' })
    }
  } else {
    res.status(401).json({ 'status': 'error', 'message': 'Invalid accessToken.' })
  }
}