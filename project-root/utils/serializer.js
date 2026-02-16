const isDate = (value) => value instanceof Date;
const isPlainObject = (value) => Object.prototype.toString.call(value) === '[object Object]';
const META_FIELDS = new Set(['__v', 'createdAt', 'updatedAt']);

const cleanObject = (value) => {
    if (value === null || value === undefined) {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map((item) => cleanObject(item));
    }

    if (isDate(value)) {
        return value;
    }

    if (isPlainObject(value)) {
        Object.keys(value).forEach((key) => {
            if (META_FIELDS.has(key)) {
                delete value[key];
                return;
            }

            if (key === '_id') {
                if (value.id === undefined || value.id === null) {
                    value.id = value[key];
                }
                delete value[key];
                return;
            }

            value[key] = cleanObject(value[key]);
        });
    }

    return value;
};

const baseTransform = (omit = []) => (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
    omit.forEach((field) => {
        if (field in ret) {
            delete ret[field];
        }
    });
    return cleanObject(ret);
};

const applyBaseSchemaOptions = (schema, { omit = [] } = {}) => {
    const transform = baseTransform(omit);
    schema.set('toJSON', { virtuals: true, transform });
    schema.set('toObject', { virtuals: true, transform });
};

module.exports = { applyBaseSchemaOptions };
