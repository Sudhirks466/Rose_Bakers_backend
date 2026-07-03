var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

const routes = require('./../src/routes/index');

router.use('/', routes);

module.exports = router;
