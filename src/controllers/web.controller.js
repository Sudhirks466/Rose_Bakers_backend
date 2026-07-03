const BaseController = require('./base.controller');
const WebService = require('../services/web.service');

class WebController extends BaseController {
   constructor() {
      super(class { });
      this.service = new WebService();
   }

   home = async (req, res) => {
      try {
         const data = await this.service.home();
         return this.commonSuccessResponse(res, data, '', 'Home data fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   banners = async (req, res) => {
      try {
         const data = await this.service.banners(req.query);
         return this.commonSuccessResponse(res, data, '', 'Banners fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   categories = async (req, res) => {
      try {
         const data = await this.service.categories();
         return this.commonSuccessResponse(res, data, '', 'Categories fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   categoryProducts = async (req, res) => {
      try {
         const data = await this.service.categoryProducts(req.params.slug, req.query);
         return this.commonSuccessResponse(res, data, '', 'Category products fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   products = async (req, res) => {
      try {
         const data = await this.service.products(req.query);
         return this.commonSuccessResponse(res, data, data.pagination, 'Products fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   productDetails = async (req, res) => {
      try {
         const data = await this.service.productDetails(req.params.id);
         return this.commonSuccessResponse(res, data, '', 'Product details fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   productReviews = async (req, res) => {
      try {
         const data = await this.service.productReviews(req.params.id);
         return this.commonSuccessResponse(res, data, '', 'Product reviews fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   contact = async (req, res) => {
      try {
         const data = await this.service.contact(req.body);
         return this.commonSuccessResponse(res, data, '', 'Contact query submitted');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   newsletterSubscribe = async (req, res) => {
      try {
         const data = await this.service.newsletterSubscribe(req.body);
         return this.commonSuccessResponse(res, data, '', 'Newsletter subscribed');
      } catch (e) { return this.commonErrorResponse(res, e.message); }
   };
}

module.exports = WebController;