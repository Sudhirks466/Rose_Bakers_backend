const httpStatusCodes = require('http-status-codes');

class BaseController {
    constructor(repoClass) {
        this.repo = new repoClass();
    }
    commonSuccessResponse(res, data, pagination = '', msg = 'Ok') {
        if (!!data) {
            if (pagination) {
                res.status(httpStatusCodes.OK).send({'data': data, pagination: pagination, success: true, status: 'Success', message: msg , code: 200});
            } else {
                res.status(httpStatusCodes.OK).send({'data': data, success: true, status: 'Success', message: msg , code: 200});
            }
        } else {
            return res.status(httpStatusCodes.OK).send({ code: httpStatusCodes.OK, message: 'Ok' });
        }
    }
    commonErrorResponse(res, msg = 'Error') {
        return res.status(httpStatusCodes.BAD_REQUEST).send({ success: false, status: 'Error', message: msg , code: httpStatusCodes.BAD_REQUEST});
    }
    //common response methods
    ok(res, data, msg = '') {
        if (!!data) {
            res.status(httpStatusCodes.OK).send({ code: httpStatusCodes.OK, data: data, message: msg });
        } else {
            return res.status(httpStatusCodes.OK).send({ code: httpStatusCodes.OK, message: 'Ok' });
        }
    }
    errorResponse(res, data, msg = 'Error') {
        if (!!data) {
            res.status(httpStatusCodes.OK).send({ code: httpStatusCodes.BAD_REQUEST, data: data, message: msg });
        } else {
            return res.status(httpStatusCodes.OK).send({ code: httpStatusCodes.BAD_REQUEST, message: msg });
        }
    }
    error(res, data) {
        return res.status(httpStatusCodes.EXPECTATION_FAILED).send({ code: httpStatusCodes.EXPECTATION_FAILED, message: data });
    }
    created(res, data, msg = '') {
        if (!!data) {
            res.status(httpStatusCodes.CREATED).send({ code: httpStatusCodes.CREATED, data: data, message: msg });
        } else {
            return res.status(httpStatusCodes.CREATED).send({ code: httpStatusCodes.CREATED, message: 'Created' });
        }
    }
    unauthorized(res, message) {
        return res.status(httpStatusCodes.UNAUTHORIZED).send({ code: httpStatusCodes.UNAUTHORIZED, message: 'Unauthorized' });
    }
    forbidden(res, message) {
        return res.status(httpStatusCodes.FORBIDDEN).send({ code: httpStatusCodes.FORBIDDEN, message: 'Forbidden' });
    }
    notFound(res, message) {
        return res.status(httpStatusCodes.NOT_FOUND).send({ code: httpStatusCodes.NOT_FOUND, message: 'Not Found' });
    }
    conflict(res, message) {
        return res.status(httpStatusCodes.CONFLICT).send({ code: httpStatusCodes.CONFLICT, message: 'Conflict' });
    }
    internalServerError(res, error) {
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ code: httpStatusCodes.INTERNAL_SERVER_ERROR, message: 'Internal Server Error' });
    }
    validationFailed(res, error, msg = '') {
        return res.status(httpStatusCodes.NOT_ACCEPTABLE).send({ code: httpStatusCodes.NOT_ACCEPTABLE, error: error, message: msg });
    }
    badrequest(res, error) {
        return res.status(httpStatusCodes.BAD_REQUEST).send({ code: httpStatusCodes.BAD_REQUEST, message: error });
    }
    //common db operations
    getAll = (req, res) => {
        this.repo.findAll().then(docs => {
            return this.ok(res, docs);
        }).catch(err => {
            return this.internalServerError(res, err);
        });
    }
    add = (req, res) => {
        let list = req.body;
        this.repo.add(list).then(doc => {
            return this.created(res, doc);
        }).catch(err => {
            console.log(err)
            let message = (err.message) ? err.message : err;
            return this.badrequest(res, message);
        });
    }
    updatebyId = (req, res) => {
        const body = req.body;
        this.repo.updatebyId(body).then(doc => {
            return this.ok(res, doc);
        }).catch(err => {
            return this.internalServerError(res, err);
        });
    }
    deleteById = (req, res) => {
        let id = req.params.id;
        this.repo.deleteById(id).then(doc => {
            return this.ok(res, doc);
        }).catch(err => {
            return this.internalServerError(res, err);
        });
    }
    getById = (req, res) => {
        let id = req.params.id;
        this.repo.getById(id).then(doc => {
            return this.ok(res, doc);
        }).catch(err => {
            return this.internalServerError(res, err);
        });
    }
    async validationError(error) {
        if (error.name === 'MongoError' && error.code === 11000) {
            let key = Object.keys(error.keyValue);
            let value = Object.values(error.keyValue);
            var message = {};
            message[key] = `${key} ${value} already exists.`;
            return message;
        } else if (error.name === "ValidationError") {
            let errors = {};
            Object.keys(error.errors).forEach((key) => {
                errors[key] = error.errors[key].message;
            });
            return errors;
        } else {
            console.log(error)
            return "Something went wrong";
        }
    }
}

module.exports = BaseController;
