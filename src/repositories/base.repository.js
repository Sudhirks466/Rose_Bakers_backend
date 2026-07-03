class BaseRepository {
    constructor(collection) {
        this.collection = collection;
    }

    findAll(filter = {}, projection = null, options = {}) {
        return this.collection.find(filter, projection, options).lean().exec();
    }

    findWithPagination(filter = {}, options = {}) {
        const {
            page = 1,
            limit = 10,
            sort = { createdAt: -1 },
            projection = null,
            populate = []
        } = options;

        const skip = (Number(page) - 1) * Number(limit);

        let query = this.collection
            .find(filter, projection)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        populate.forEach((p) => {
            query = query.populate(p);
        });

        return query.lean().exec();
    }

    count(filter = {}) {
        return this.collection.countDocuments(filter);
    }

    findOne(filter = {}, projection = null) {
        return this.collection.findOne(filter, projection).exec();
    }

    findOneLean(filter = {}, projection = null) {
        return this.collection.findOne(filter, projection).lean().exec();
    }

    findById(id, projection = null) {
        return this.collection.findById(id, projection).exec();
    }

    findByIdLean(id, projection = null) {
        return this.collection.findById(id, projection).lean().exec();
    }

    create(data) {
        return this.collection.create(data);
    }

    createMany(data) {
        return this.collection.insertMany(data);
    }

    updateById(id, data, options = {}) {
        return this.collection.findByIdAndUpdate(
            id,
            data,
            {
                new: true,
                runValidators: true,
                ...options
            }
        ).exec();
    }

    updateOne(filter, data, options = {}) {
        return this.collection.findOneAndUpdate(
            filter,
            data,
            {
                new: true,
                runValidators: true,
                ...options
            }
        ).exec();
    }

    deleteById(id) {
        return this.collection.findByIdAndDelete(id).exec();
    }

    softDeleteById(id) {
        return this.collection.findByIdAndUpdate(
            id,
            { isDeleted: true, isActive: false },
            { new: true }
        ).exec();
    }

    exists(filter = {}) {
        return this.collection.exists(filter);
    }
}

module.exports = BaseRepository;