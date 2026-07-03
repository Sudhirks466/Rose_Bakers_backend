const SellerProfileRepository = require('../repositories/sellerProfile.repository');
const ProductRepository = require('../repositories/product.repository');
const ProductImageRepository = require('../repositories/productImage.repository');
const ProductVariantRepository = require('../repositories/productVariant.repository');
const ProductVariantPriceRepository = require('../repositories/productVariantPrice.repository');
const InventoryRepository = require('../repositories/inventory.repository');
const OrderRepository = require('../repositories/order.repository');
const SellerAccountRepository = require('../repositories/sellerAccount.repository');
const TransactionRepository = require('../repositories/transaction.repository');
const PromoCodeAssignmentRepository = require('../repositories/promoCodeAssignment.repository');
const CartRepository = require('../repositories/cart.repository');
const OrderItemRepository = require('../repositories/orderItem.repository');
const OrderStatusHistoryRepository = require('../repositories/orderStatusHistory.repository');
const PromoCodeRepository = require('../repositories/promoCode.repository');
const PromoCodeUsageRepository = require('../repositories/promoCodeUsage.repository');

class SellerService {
    constructor() {
        this.sellerRepo = new SellerProfileRepository();
        this.productRepo = new ProductRepository();
        this.productImageRepo = new ProductImageRepository();
        this.variantRepo = new ProductVariantRepository();
        this.priceRepo = new ProductVariantPriceRepository();
        this.inventoryRepo = new InventoryRepository();
        this.orderRepo = new OrderRepository();
        this.sellerAccountRepo = new SellerAccountRepository();
        this.transactionRepo = new TransactionRepository();
        this.promoAssignRepo = new PromoCodeAssignmentRepository();
        this.cartRepo = new CartRepository();
        this.orderItemRepo = new OrderItemRepository();
        this.orderStatusRepo = new OrderStatusHistoryRepository();
        this.promoRepo = new PromoCodeRepository();
        this.promoUsageRepo = new PromoCodeUsageRepository();
    }

    async getSellerByUserId(userId) {
        const seller = await this.sellerRepo.findByUserId(userId);

        if (!seller) throw new Error('Seller profile not found');

        if (seller.status !== 'APPROVED' || !seller.isActive) {
            throw new Error('Seller account is not approved or inactive');
        }

        return seller;
    }

    async dashboard(userId) {
        const seller = await this.getSellerByUserId(userId);

        const [
            account,
            orderSummary,
            latestOrders,
            transactions,
            promoCodes
        ] = await Promise.all([
            this.sellerAccountRepo.findBySellerId(seller._id),
            this.orderRepo.sellerOrderSummary(seller._id),
            this.orderRepo.findSellerLatestOrders(seller._id, 10),
            this.transactionRepo.findSellerLatestTransactions(seller._id, 10),
            this.promoAssignRepo.findActiveSellerAssignments(seller._id)
        ]);

        return {
            seller,
            account,
            orderSummary,
            latestOrders,
            transactions,
            promoCodes
        };
    }

    async profile(userId) {
        return this.getSellerByUserId(userId);
    }

    async updateProfile(userId, body) {
        const seller = await this.getSellerByUserId(userId);

        const allowedFields = [
            'shopName',
            'ownerName',
            'phone',
            'email',
            'address',
            'city',
            'state',
            'pincode',
            'gstNumber',
            'panNumber',
            'fssaiNumber',
            'bankDetails'
        ];

        const updateData = {};

        allowedFields.forEach((key) => {
            if (body[key] !== undefined) updateData[key] = body[key];
        });

        return this.sellerRepo.updateById(seller._id, updateData);
    }

    async products(userId, query) {
        await this.getSellerByUserId(userId);
        return this.productRepo.findSellerProducts(query);
    }

    async productDetails(userId, productId) {
        await this.getSellerByUserId(userId);

        const product = await this.productRepo.findSellerProductById(productId);
        if (!product) throw new Error('Product not found');

        const [images, variants, prices, inventory] = await Promise.all([
            this.productImageRepo.findByProductId(productId),
            this.variantRepo.findByProductId(productId),
            this.priceRepo.findByProductId(productId),
            this.inventoryRepo.findByProductId(productId)
        ]);

        return {
            product,
            images,
            variants,
            prices,
            inventory
        };
    }

    async account(userId) {
        const seller = await this.getSellerByUserId(userId);

        let account = await this.sellerAccountRepo.findBySellerId(seller._id);

        if (!account) {
            account = await this.sellerAccountRepo.create({
                sellerId: seller._id,
                totalPurchaseAmount: 0,
                totalPaidAmount: 0,
                outstandingAmount: 0,
                creditLimit: 0,
                accountStatus: 'ACTIVE'
            });
        }

        return account;
    }

    async transactions(userId, query) {
        const seller = await this.getSellerByUserId(userId);
        return this.transactionRepo.findSellerTransactions(seller._id, query);
    }

    async promocodes(userId) {
        const seller = await this.getSellerByUserId(userId);
        return this.promoAssignRepo.findActiveSellerAssignments(seller._id);
    }

    async getCart(userId) {
        const seller = await this.getSellerByUserId(userId);
        const cart = await this.cartRepo.findSellerCartByUserId(userId);
        return cart || this.cartRepo.createEmptyCart(userId);
    }

    async addToCart(userId, body) {
        await this.getSellerByUserId(userId);

        const { productId, productPriceId, quantity = 1, cakeMessage = '' } = body;

        if (!productId || !productPriceId) {
            throw new Error('Product and price are required');
        }

        const product = await this.productRepo.findSellerProductById(productId);
        if (!product) throw new Error('Product not found');

        const price = await this.priceRepo.findActiveById(productPriceId);
        if (!price) throw new Error('Product price not found');

        let cart = await this.cartRepo.findRawByUserId(userId);
        if (!cart) cart = await this.cartRepo.createEmptyCart(userId);

        const existingItem = cart.items.find(
            (item) =>
                String(item.productId) === String(productId) &&
                String(item.productPriceId) === String(productPriceId) &&
                item.priceType === 'SELLER'
        );

        if (existingItem) {
            existingItem.quantity += Number(quantity);
            existingItem.totalPrice = existingItem.quantity * existingItem.unitPrice;
        } else {
            cart.items.push({
                productId,
                productPriceId,
                quantity: Number(quantity),
                cakeMessage,
                priceType: 'SELLER',
                unitPrice: price.sellerPurchasePrice,
                totalPrice: Number(quantity) * Number(price.sellerPurchasePrice)
            });
        }

        this.calculateSellerCart(cart);
        await cart.save();

        return this.cartRepo.findSellerCartByUserId(userId);
    }

    async updateCartItem(userId, itemId, quantity) {
        await this.getSellerByUserId(userId);

        if (!quantity || Number(quantity) < 1) {
            throw new Error('Quantity must be at least 1');
        }

        const cart = await this.cartRepo.findRawByUserId(userId);
        if (!cart) throw new Error('Cart not found');

        const item = cart.items.id(itemId);
        if (!item || item.priceType !== 'SELLER') {
            throw new Error('Cart item not found');
        }

        item.quantity = Number(quantity);
        item.totalPrice = item.quantity * item.unitPrice;

        this.calculateSellerCart(cart);
        await cart.save();

        return this.cartRepo.findSellerCartByUserId(userId);
    }

    async removeCartItem(userId, itemId) {
        await this.getSellerByUserId(userId);

        const cart = await this.cartRepo.findRawByUserId(userId);
        if (!cart) throw new Error('Cart not found');

        const item = cart.items.id(itemId);
        if (!item || item.priceType !== 'SELLER') {
            throw new Error('Cart item not found');
        }

        item.deleteOne();

        this.calculateSellerCart(cart);
        await cart.save();

        return this.cartRepo.findSellerCartByUserId(userId);
    }

    async clearCart(userId) {
        await this.getSellerByUserId(userId);

        const cart = await this.cartRepo.findRawByUserId(userId);
        if (!cart) return this.cartRepo.createEmptyCart(userId);

        cart.items = cart.items.filter((item) => item.priceType !== 'SELLER');

        cart.couponCode = '';
        cart.discountAmount = 0;

        this.calculateSellerCart(cart);
        await cart.save();

        return this.cartRepo.findSellerCartByUserId(userId);
    }

    async applyPromoCode(userId, code) {
        const seller = await this.getSellerByUserId(userId);

        if (!code) throw new Error('Promo code is required');

        const cart = await this.cartRepo.findRawByUserId(userId);
        if (!cart || !cart.items.some((item) => item.priceType === 'SELLER')) {
            throw new Error('Seller cart is empty');
        }

        const promo = await this.promoRepo.findActiveSellerPromo(code);
        if (!promo) throw new Error('Invalid seller promo code');

        const assigned = await this.promoAssignRepo.findByPromoAndSeller(promo._id, seller._id);
        if (!assigned || assigned.status !== 'ACTIVE') {
            throw new Error('Promo code is not assigned to this seller');
        }

        if (promo.minOrderAmount && cart.subtotal < promo.minOrderAmount) {
            throw new Error(`Minimum purchase amount should be ${promo.minOrderAmount}`);
        }

        let discount = 0;

        if (promo.discountType === 'PERCENTAGE') {
            discount = (cart.subtotal * promo.discountValue) / 100;

            if (promo.maxDiscountAmount > 0) {
                discount = Math.min(discount, promo.maxDiscountAmount);
            }
        } else {
            discount = promo.discountValue;
        }

        cart.couponCode = promo.code;
        cart.discountAmount = Math.min(discount, cart.subtotal);

        this.calculateSellerCart(cart);
        await cart.save();

        return this.cartRepo.findSellerCartByUserId(userId);
    }

    async removePromoCode(userId) {
        await this.getSellerByUserId(userId);

        const cart = await this.cartRepo.findRawByUserId(userId);
        if (!cart) throw new Error('Cart not found');

        cart.couponCode = '';
        cart.discountAmount = 0;

        this.calculateSellerCart(cart);
        await cart.save();

        return this.cartRepo.findSellerCartByUserId(userId);
    }

    async createPurchaseOrder(userId, body) {
        const seller = await this.getSellerByUserId(userId);

        const cart = await this.cartRepo.findRawByUserId(userId);
        if (!cart) throw new Error('Cart not found');

        const sellerItems = cart.items.filter((item) => item.priceType === 'SELLER');
        if (!sellerItems.length) throw new Error('Seller cart is empty');

        const account = await this.sellerAccountRepo.findBySellerId(seller._id);

        if (account && account.accountStatus !== 'ACTIVE') {
            throw new Error('Seller account is not active');
        }

        const orderNo = `RBS${Date.now()}`;

        const order = await this.orderRepo.create({
            orderNo,
            orderType: 'SELLER_PURCHASE',
            customerId: userId,
            sellerId: seller._id,
            deliveryAddress: {
                fullName: seller.ownerName,
                mobile: seller.phone,
                houseNo: seller.address,
                street: seller.address,
                landmark: '',
                city: seller.city,
                state: seller.state,
                pincode: seller.pincode
            },
            deliveryDate: body.deliveryDate,
            deliverySlot: body.deliverySlot,
            specialInstructions: body.specialInstructions,
            subtotal: cart.subtotal,
            deliveryCharge: 0,
            gstAmount: cart.gstAmount || 0,
            discountAmount: cart.discountAmount || 0,
            grandTotal: cart.grandTotal,
            platformFee: 0,
            sellerPayout: 0,
            paymentMethod: body.paymentMethod || 'COD',
            paymentStatus: 'PENDING',
            orderStatus: 'PLACED',
            couponCode: cart.couponCode,
            createdBy: userId
        });

        const orderItems = sellerItems.map((item) => ({
            orderId: order._id,
            productId: item.productId,
            productPriceId: item.productPriceId,
            productName: '',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            cakeMessage: item.cakeMessage,
            sellerPurchasePrice: item.unitPrice,
            customerSellingPrice: 0,
            sellerMargin: 0
        }));

        await this.orderItemRepo.createMany(orderItems);

        await this.orderStatusRepo.create({
            orderId: order._id,
            status: 'PLACED',
            note: 'Seller purchase order placed',
            changedBy: userId,
            changedByRole: 'SELLER'
        });

        if (cart.couponCode) {
            const promo = await this.promoRepo.findActiveSellerPromo(cart.couponCode);

            if (promo) {
                await this.promoUsageRepo.create({
                    promoCodeId: promo._id,
                    userId,
                    sellerId: seller._id,
                    orderId: order._id,
                    code: promo.code,
                    promoType: 'SELLER',
                    discountAmount: cart.discountAmount || 0,
                    sellerExtraMarginAmount: 0,
                    orderAmountBeforeDiscount: cart.subtotal,
                    orderAmountAfterDiscount: cart.grandTotal
                });
            }
        }

        await this.updateSellerAccountOnPurchase(seller._id, cart.grandTotal);

        await this.clearCart(userId);

        return this.orderRepo.findAdminOrderById(order._id);
    }

    async purchaseOrders(userId, query) {
        const seller = await this.getSellerByUserId(userId);
        return this.orderRepo.findSellerPurchaseOrders(seller._id, query);
    }

    async purchaseOrderDetails(userId, orderId) {
        const seller = await this.getSellerByUserId(userId);

        const order = await this.orderRepo.findSellerPurchaseOrderById(seller._id, orderId);
        if (!order) throw new Error('Purchase order not found');

        const items = await this.orderItemRepo.findByOrderId(orderId);
        const timeline = await this.orderStatusRepo.findByOrderId(orderId);

        return { order, items, timeline };
    }

    async cancelPurchaseOrder(userId, orderId, reason = '') {
        const seller = await this.getSellerByUserId(userId);

        const order = await this.orderRepo.findSellerPurchaseOrderRawById(seller._id, orderId);
        if (!order) throw new Error('Purchase order not found');

        if (['DELIVERED', 'CANCELLED'].includes(order.orderStatus)) {
            throw new Error('This order cannot be cancelled');
        }

        order.orderStatus = 'CANCELLED';
        order.cancelledAt = new Date();
        order.cancellationReason = reason || 'Cancelled by seller';

        await order.save();

        await this.orderStatusRepo.create({
            orderId,
            status: 'CANCELLED',
            note: reason || 'Cancelled by seller',
            changedBy: userId,
            changedByRole: 'SELLER'
        });

        return this.orderRepo.findAdminOrderById(orderId);
    }

    calculateSellerCart(cart) {
        const sellerItems = cart.items.filter((item) => item.priceType === 'SELLER');

        cart.subtotal = sellerItems.reduce(
            (sum, item) => sum + Number(item.totalPrice || 0),
            0
        );

        cart.deliveryCharge = 0;
        cart.gstAmount = 0;
        cart.grandTotal =
            cart.subtotal +
            cart.deliveryCharge +
            cart.gstAmount -
            Number(cart.discountAmount || 0);

        if (cart.grandTotal < 0) cart.grandTotal = 0;
    }

    async updateSellerAccountOnPurchase(sellerId, amount) {
        let account = await this.sellerAccountRepo.findBySellerId(sellerId);

        if (!account) {
            account = await this.sellerAccountRepo.create({
                sellerId,
                totalPurchaseAmount: 0,
                totalPaidAmount: 0,
                outstandingAmount: 0,
                creditLimit: 0,
                accountStatus: 'ACTIVE'
            });
        }

        const totalPurchaseAmount =
            Number(account.totalPurchaseAmount || 0) + Number(amount || 0);

        const outstandingAmount =
            totalPurchaseAmount - Number(account.totalPaidAmount || 0);

        return this.sellerAccountRepo.updateById(account._id, {
            totalPurchaseAmount,
            outstandingAmount,
            lastPurchaseDate: new Date()
        });
    }

    async customerOrders(userId, query) {
        const seller = await this.getSellerByUserId(userId);
        return this.orderRepo.findSellerCustomerOrders(seller._id, query);
    }

    async customerOrderDetails(userId, orderId) {
        const seller = await this.getSellerByUserId(userId);

        const order = await this.orderRepo.findSellerCustomerOrderById(seller._id, orderId);
        if (!order) throw new Error('Customer order not found');

        const items = await this.orderItemRepo.findByOrderId(orderId);
        const timeline = await this.orderStatusRepo.findByOrderId(orderId);

        return { order, items, timeline };
    }

    async acceptCustomerOrder(userId, orderId) {
        const seller = await this.getSellerByUserId(userId);

        const order = await this.orderRepo.findSellerCustomerOrderRawById(seller._id, orderId);
        if (!order) throw new Error('Customer order not found');

        if (!['PLACED', 'PENDING'].includes(order.orderStatus)) {
            throw new Error('Only placed/pending orders can be accepted');
        }

        order.orderStatus = 'ACCEPTED';
        await order.save();

        await this.orderStatusRepo.create({
            orderId,
            status: 'ACCEPTED',
            note: 'Order accepted by seller',
            changedBy: userId,
            changedByRole: 'SELLER'
        });

        return this.orderRepo.findAdminOrderById(orderId);
    }

    async rejectCustomerOrder(userId, orderId, reason = '') {
        const seller = await this.getSellerByUserId(userId);

        const order = await this.orderRepo.findSellerCustomerOrderRawById(seller._id, orderId);
        if (!order) throw new Error('Customer order not found');

        if (['DELIVERED', 'CANCELLED'].includes(order.orderStatus)) {
            throw new Error('This order cannot be rejected');
        }

        order.orderStatus = 'CANCELLED';
        order.cancelledAt = new Date();
        order.cancellationReason = reason || 'Rejected by seller';

        await order.save();

        await this.orderStatusRepo.create({
            orderId,
            status: 'CANCELLED',
            note: reason || 'Rejected by seller',
            changedBy: userId,
            changedByRole: 'SELLER'
        });

        return this.orderRepo.findAdminOrderById(orderId);
    }

    async updateCustomerOrderStatus(userId, orderId, status, note = '') {
        const seller = await this.getSellerByUserId(userId);

        const allowedStatus = [
            'ACCEPTED',
            'PREPARING',
            'PACKED',
            'OUT_FOR_DELIVERY',
            'DELIVERED'
        ];

        if (!allowedStatus.includes(status)) {
            throw new Error('Invalid seller order status');
        }

        const order = await this.orderRepo.findSellerCustomerOrderRawById(seller._id, orderId);
        if (!order) throw new Error('Customer order not found');

        if (['CANCELLED', 'DELIVERED'].includes(order.orderStatus)) {
            throw new Error('This order cannot be updated');
        }

        order.orderStatus = status;

        if (status === 'DELIVERED') {
            order.deliveredAt = new Date();
            order.paymentStatus = order.paymentMethod === 'COD' ? 'PAID' : order.paymentStatus;
        }

        await order.save();

        await this.orderStatusRepo.create({
            orderId,
            status,
            note: note || `Order status updated to ${status}`,
            changedBy: userId,
            changedByRole: 'SELLER'
        });

        return this.orderRepo.findAdminOrderById(orderId);
    }
}

module.exports = SellerService;