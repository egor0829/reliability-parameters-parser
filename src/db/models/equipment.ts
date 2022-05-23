import mongoose from 'mongoose';
import unique from 'src/db/utils/unique';

interface IEquipmentSchema extends Record<string, any> {
    name: string;
    url: string;
}

const EquipmentSchema = new mongoose.Schema<IEquipmentSchema>(
    {
        name: {
            type: String,
            required: true,
            validate: [unique('EquipmentModel', 'name', true), 'unique'],
            trim: true
        },
        url: String,
        date: {type: Date, default: Date.now},
        imageUrl: String,
        description: String,
        goodImageUrls: [String],
        details: mongoose.Schema.Types.Mixed,
        company: {type: mongoose.Schema.Types.ObjectId, ref: 'CompanyModel'},
        categories: [String]
    },
    {strict: false}
);

const EquipmentModel = mongoose.model<IEquipmentSchema>('EquipmentModel', EquipmentSchema);

export default EquipmentModel;
export {IEquipmentSchema};
