import mongoose from 'mongoose';
import EquipmentModel, {IEquipmentSchema} from 'src/db/models/equipment';
import {ICompanySchema} from 'src/db/models/company';
import CompanyService from 'src/db/services/company';
import unique from 'src/db/utils/unique';

class EquipmentService {
    // private static _difference(origObj: SerializableObject, newObj: SerializableObject) {
    //     function changes(newObj: SerializableObject, origObj: SerializableObject) {
    //         let arrayIndexCounter = 0;
    //         return transform(
    //             newObj,
    //             function (result: SerializableObject, value: Serializable | SerializableObject, key: string) {
    //                 if (!isEqual(value, origObj[key])) {
    //                     const resultKey = isArray(origObj) ? arrayIndexCounter++ : key;
    //                     result[resultKey] =
    //                         isObject(value) && isObject(origObj[key])
    //                             ? changes(value as SerializableObject, origObj[key] as SerializableObject)
    //                             : value;
    //                 }
    //             }
    //         );
    //     }
    //     return changes(newObj, origObj);
    // }

    static async saveOrUpdate(equipment: IEquipmentSchema, company?: ICompanySchema) {
        // EquipmentModel.findOneAndUpdate<IEquipmentSchema>(
        //     {name: equipmentDoc.name},
        //     equipmentDoc,
        //     {upsert: true},
        //     function (error, result) {
        //         console.log('saveOrUpdate', error, result);
        //         console.log('result:', result);
        //         console.log('equipmentDoc:', equipmentDoc);
        //         console.log('isEqual:', isEqual(result, equipmentDoc));
        //         if (!error) {
        //             // If the document doesn't exist
        //             if (!result) {
        //                 // Create it
        //                 result = new EquipmentModel(equipmentDoc);
        //             }
        //             // Save the document
        //             result.save(function (error: mongoose.CallbackError) {
        //                 if (!error) {
        //                     // Do something with the document
        //                 } else {
        //                     throw error;
        //                 }
        //             });
        //         }
        //     }
        // );

        if (company) {
            const result = await CompanyService.saveOrUpdate(company);
            equipment.company = result._id;
        }
        return EquipmentModel.findOneAndUpdate<IEquipmentSchema>(
            {name: equipment.name, returnDocument: 'after'},
            equipment,
            {
                new: true,
                upsert: true
            }
        );
    }
}

export default EquipmentService;
