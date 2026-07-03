const express = require('express');
const router = express.Router();

const WebController = require('./../src/controllers/web.controller');

const ctrl = new WebController();

router.get('/home', ctrl.home);
router.get('/banners', ctrl.banners);

router.get('/categories', ctrl.categories);
router.get('/categories/:slug/products', ctrl.categoryProducts);

router.get('/products', ctrl.products);
router.get('/products/:id', ctrl.productDetails);
router.get('/products/:id/reviews', ctrl.productReviews);

router.post('/contact', ctrl.contact);

router.post('/newsletter/subscribe', ctrl.newsletterSubscribe);

module.exports = router;