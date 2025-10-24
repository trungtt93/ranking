const express = require('express');
const session = require('express-session');
const app = express();
const path = require('path');
const port = 3000;
const expressLayouts = require('express-ejs-layouts');
const route = require('./routes/route');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'hihi',
  resave: false,
  saveUninitialized: false,
}));

app.use(expressLayouts);
app.set('layout', path.join(__dirname, 'views/layouts/main'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

route(app);
app.use(function(req, res) {
  res.send("Cút")
});
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});