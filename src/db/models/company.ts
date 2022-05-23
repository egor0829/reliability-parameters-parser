import mongoose from 'mongoose';
import unique from 'src/db/utils/unique';

interface ICompanySchema extends Record<string, any> {
    name: string;
}

const CompanySchema = new mongoose.Schema<ICompanySchema>(
    {
        name: {
            type: String,
            required: true,
            validate: [unique('CompanyModel', 'name', true), 'unique'],
            trim: true
        },
        date: Number
    },
    {strict: false}
);

const CompanyModel = mongoose.model<ICompanySchema>('CompanyModel', CompanySchema);

export default CompanyModel;
export {ICompanySchema};
