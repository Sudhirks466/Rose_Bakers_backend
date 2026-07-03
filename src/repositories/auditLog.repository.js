const BaseRepository = require('./base.repository');
const AuditLog = require('../models/AuditLog.model');

class AuditLogRepository extends BaseRepository {
    constructor() {
        super(AuditLog);
        this.auditLog = AuditLog;
    }

    async findAdminAuditLogs(query = {}) {
        const {
            page = 1,
            limit = 20,
            module,
            action,
            performedBy,
            fromDate,
            toDate,
            search
        } = query;

        const filter = {};

        if (module) filter.module = module;
        if (action) filter.action = action;
        if (performedBy) filter.performedBy = performedBy;

        if (fromDate || toDate) {
            filter.createdAt = {};
            if (fromDate) filter.createdAt.$gte = new Date(fromDate);
            if (toDate) filter.createdAt.$lte = new Date(toDate);
        }

        if (search) {
            filter.$or = [
                { action: { $regex: search, $options: 'i' } },
                { entityName: { $regex: search, $options: 'i' } },
                { note: { $regex: search, $options: 'i' } }
            ];
        }

        const pageNo = Number(page);
        const pageLimit = Number(limit);
        const skip = (pageNo - 1) * pageLimit;

        const [data, total] = await Promise.all([
            this.auditLog
                .find(filter)
                .populate('performedBy', 'name email phone roles')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageLimit)
                .lean()
                .exec(),

            this.auditLog.countDocuments(filter)
        ]);

        return {
            data,
            pagination: {
                page: pageNo,
                limit: pageLimit,
                total,
                totalPages: Math.ceil(total / pageLimit)
            }
        };
    }

    findDetailsById(id) {
        return this.auditLog
            .findById(id)
            .populate('performedBy', 'name email phone roles')
            .lean()
            .exec();
    }
}

module.exports = AuditLogRepository;