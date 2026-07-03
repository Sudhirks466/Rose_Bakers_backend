const BaseRepository = require('./base.repository');
const File = require('../models/File.model');

class FileRepository extends BaseRepository {
    constructor() {
        super(File);
        this.file = File;
    }

    async findAdminFiles(query = {}) {
        const { page = 1, limit = 20, module, referenceId } = query;
        const filter = { isDeleted: false };

        if (module) filter.module = module;
        if (referenceId) filter.referenceId = referenceId;

        const skip = (Number(page) - 1) * Number(limit);

        const [data, total] = await Promise.all([
            this.file.find(filter)
                .populate('uploadedBy', 'name email phone')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean()
                .exec(),
            this.file.countDocuments(filter)
        ]);

        return {
            data,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            }
        };
    }
}

module.exports = FileRepository;