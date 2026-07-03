const BaseRepository = require('./base.repository');
const PlatformSetting = require('../models/PlatformSetting.model');

class PlatformSettingRepository extends BaseRepository {
    constructor() {
        super(PlatformSetting);
        this.setting = PlatformSetting;
    }

    async getOrCreateDefault() {
        let settings = await this.setting.findOne().exec();

        if (!settings) {
            settings = await this.setting.create({
                platformName: 'RoseBakers',
                supportEmail: 'support@rosebakers.in',
                defaultCity: 'Deoria',
                platformStatus: 'ACTIVE',
                commissionPercent: 15,
                settlementCycle: 'WEEKLY',
                minimumPayout: 1000,
                baseDeliveryCharge: 40,
                freeDeliveryAbove: 499,
                midnightDeliveryCharge: 199,
                deliveryRadiusKm: 10,
                defaultDeliveryTime: '20 Minutes',
                paymentGateway: 'RAZORPAY',
                notifications: {
                    newSellerRegistration: true,
                    sellerApprovalRequest: true,
                    orderIssueAlert: true,
                    payoutAlert: true,
                    reportReadyNotification: false
                }
            });
        }

        return settings;
    }
}

module.exports = PlatformSettingRepository;