import mongoose from 'mongoose';

// https://gist.github.com/edinella/5819557
/**
 * Generates Mongoose uniqueness validator
 *
 * @param string modelName
 * @param string field
 * @param boolean caseSensitive
 *
 * @return function
 **/
function unique(modelName: string, field: string, caseSensitive: boolean) {
    return function (value: string, respond: (res: boolean) => void) {
        if (value === null) {
            console.error('Attempt to save null value', {modelName, field});
        }
        if (value && value.length) {
            let query = mongoose
                .model(modelName)
                .where(field, new RegExp('^' + value + '$', caseSensitive ? 'i' : undefined));
            // @ts-ignore
            if (!this.isNew) query = query.where('_id').ne(this._id);
            query.count(function (err, n) {
                respond(n < 1);
            });
        } else respond(false);
    };
}

export default unique;
