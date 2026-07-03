const AuditLogRepository = require('../repositories/auditLog.repository');

const auditLogger = async ({
    action,
    module,
    entityId,
    entityName,
    performedBy,
    performedByRole,
    oldValue,
    newValue,
    ipAddress,
    userAgent,
    note
}) => {
    try {
        const repo = new AuditLogRepository();

        await repo.create({
            action,
            module,
            entityId,
            entityName,
            performedBy,
            performedByRole,
            oldValue,
            newValue,
            ipAddress,
            userAgent,
            note
        });
    } catch (error) {
        console.error('Audit log error:', error.message);
    }
};

module.exports = auditLogger;