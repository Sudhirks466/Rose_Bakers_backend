const BaseController = require('./base.controller');
const SellerService = require('./../services/seller.service');

class SellerController extends BaseController {
    constructor() {
        super(class { });
        this.service = new SellerService();
    }

    dashboard = async (req, res) => {
        try {
            const data = await this.service.dashboard(req.user.sub);
            return this.commonSuccessResponse(res, data, '', 'Seller dashboard fetched');
        } catch (e) {
            return this.commonErrorResponse(res, e.message);
        }
    };

    profile = async (req, res) => {
        try {
            const data = await this.service.profile(req.user.sub);
            return this.commonSuccessResponse(res, data, '', 'Seller profile fetched');
        } catch (e) {
            return this.commonErrorResponse(res, e.message);
        }
    };

    updateProfile = async (req, res) => {
        try {
            const data = await this.service.updateProfile(req.user.sub, req.body);
            return this.commonSuccessResponse(res, data, '', 'Seller profile updated');
        } catch (e) {
            return this.commonErrorResponse(res, e.message);
        }
    };

    products = async (req, res) => {
        try {
            const data = await this.service.products(req.user.sub, req.query);
            return this.commonSuccessResponse(res, data.data, data.pagination, 'Seller products fetched');
        } catch (e) {
            return this.commonErrorResponse(res, e.message);
        }
    };

    productDetails = async (req, res) => {
        try {
            const data = await this.service.productDetails(req.user.sub, req.params.id);
            return this.commonSuccessResponse(res, data, '', 'Seller product details fetched');
        } catch (e) {
            return this.commonErrorResponse(res, e.message);
        }
    };

    account = async (req, res) => {
        try {
            const data = await this.service.account(req.user.sub);
            return this.commonSuccessResponse(res, data, '', 'Seller account fetched');
        } catch (e) {
            return this.commonErrorResponse(res, e.message);
        }
    };

    transactions = async (req, res) => {
        try {
            const data = await this.service.transactions(req.user.sub, req.query);
            return this.commonSuccessResponse(res, data.data, data.pagination, 'Seller transactions fetched');
        } catch (e) {
            return this.commonErrorResponse(res, e.message);
        }
    };

    promocodes = async (req, res) => {
        try {
            const data = await this.service.promocodes(req.user.sub);
            return this.commonSuccessResponse(res, data, '', 'Seller promo codes fetched');
        } catch (e) {
            return this.commonErrorResponse(res, e.message);
        }
    };

    getCart = async (req, res) => {
        try {
            const data = await this.service.getCart(req.user.sub);
            return this.commonSuccessResponse(res, data, '', 'Seller cart fetched');
        } catch (e) {
            return this.commonErrorResponse(res, e.message);
        }
    };

    addToCart = async (req, res) => {
        try {
            const data = await this.service.addToCart(req.user.sub, req.body);
            return this.commonSuccessResponse(res, data, '', 'Item added to seller cart');
        } catch (e) {
            return this.commonErrorResponse(res, e.message);
        }
    };

    updateCartItem = async (req, res) => {
        try {
            const data = await this.service.updateCartItem(
                req.user.sub,
                req.params.itemId,
                req.body.quantity
            );
            return this.commonSuccessResponse(res, data, '', 'Seller cart updated');
        } catch (e) {
            return this.commonErrorResponse(res, e.message);
        }
    };

    removeCartItem = async (req, res) => {
        try {
            const data = await this.service.removeCartItem(req.user.sub, req.params.itemId);
            return this.commonSuccessResponse(res, data, '', 'Item removed from seller cart');
        } catch (e) {
            return this.commonErrorResponse(res, e.message);
        }
    };

    clearCart = async (req, res) => {
        try {
            const data = await this.service.clearCart(req.user.sub);
            return this.commonSuccessResponse(res, data, '', 'Seller cart cleared');
        } catch (e) {
            return this.commonErrorResponse(res, e.message);
        }
    };

    applyPromoCode = async (req, res) => {
        try {
            const data = await this.service.applyPromoCode(req.user.sub, req.body.code);
            return this.commonSuccessResponse(res, data, '', 'Seller promo applied');
        } catch (e) {
            return this.commonErrorResponse(res, e.message);
        }
    };

    removePromoCode = async (req, res) => {
        try {
            const data = await this.service.removePromoCode(req.user.sub);
            return this.commonSuccessResponse(res, data, '', 'Seller promo removed');
        } catch (e) {
            return this.commonErrorResponse(res, e.message);
        }
    };

    createPurchaseOrder = async (req, res) => {
        try {
            const data = await this.service.createPurchaseOrder(req.user.sub, req.body);
            return this.commonSuccessResponse(res, data, '', 'Seller purchase order created');
        } catch (e) {
            return this.commonErrorResponse(res, e.message);
        }
    };

    purchaseOrders = async (req, res) => {
        try {
            const data = await this.service.purchaseOrders(req.user.sub, req.query);
            return this.commonSuccessResponse(res, data.data, data.pagination, 'Seller purchase orders fetched');
        } catch (e) {
            return this.commonErrorResponse(res, e.message);
        }
    };

    purchaseOrderDetails = async (req, res) => {
        try {
            const data = await this.service.purchaseOrderDetails(req.user.sub, req.params.id);
            return this.commonSuccessResponse(res, data, '', 'Seller purchase order details fetched');
        } catch (e) {
            return this.commonErrorResponse(res, e.message);
        }
    };

    cancelPurchaseOrder = async (req, res) => {
        try {
            const data = await this.service.cancelPurchaseOrder(
                req.user.sub,
                req.params.id,
                req.body.reason
            );
            return this.commonSuccessResponse(res, data, '', 'Seller purchase order cancelled');
        } catch (e) {
            return this.commonErrorResponse(res, e.message);
        }
    };

    customerOrders = async (req, res) => {
        try {
            const data = await this.service.customerOrders(req.user.sub, req.query);
            return this.commonSuccessResponse(res, data.data, data.pagination, 'Customer orders fetched');
        } catch (e) {
            return this.commonErrorResponse(res, e.message);
        }
    };

    customerOrderDetails = async (req, res) => {
        try {
            const data = await this.service.customerOrderDetails(req.user.sub, req.params.id);
            return this.commonSuccessResponse(res, data, '', 'Customer order details fetched');
        } catch (e) {
            return this.commonErrorResponse(res, e.message);
        }
    };

    acceptCustomerOrder = async (req, res) => {
        try {
            const data = await this.service.acceptCustomerOrder(req.user.sub, req.params.id);
            return this.commonSuccessResponse(res, data, '', 'Customer order accepted');
        } catch (e) {
            return this.commonErrorResponse(res, e.message);
        }
    };

    rejectCustomerOrder = async (req, res) => {
        try {
            const data = await this.service.rejectCustomerOrder(
                req.user.sub,
                req.params.id,
                req.body.reason
            );
            return this.commonSuccessResponse(res, data, '', 'Customer order rejected');
        } catch (e) {
            return this.commonErrorResponse(res, e.message);
        }
    };

    updateCustomerOrderStatus = async (req, res) => {
        try {
            const data = await this.service.updateCustomerOrderStatus(
                req.user.sub,
                req.params.id,
                req.body.status,
                req.body.note
            );
            return this.commonSuccessResponse(res, data, '', 'Customer order status updated');
        } catch (e) {
            return this.commonErrorResponse(res, e.message);
        }
    };
}

module.exports = SellerController;