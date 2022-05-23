import {Router} from 'express';
import EquipmentModel from 'src/db/models/equipment';
import {ReliabilityParameter} from 'src/parser/lib/reliability-parameters';
import {escapeRegExp} from 'src/server/utils/regexp';

const router = Router();

interface EquipmentQuery {
    page?: string;
    size?: string;
    name?: string;
    indicators?: Record<ReliabilityParameter, string>;
}

router.get<unknown, unknown, unknown, EquipmentQuery>('/', async (req, res) => {
    try {
        const rawReqQuery = req.query;
        const reqQuery = {
            page: rawReqQuery.page ? parseInt(rawReqQuery.page, 10) : 1,
            size: rawReqQuery.size ? parseInt(rawReqQuery.size, 10) : 10,
            name: rawReqQuery.name || '',
            indicators: {
                mtbf: rawReqQuery.indicators?.MTBF === 'true',
                mttr: rawReqQuery.indicators?.MTTR === 'true',
                mttf: rawReqQuery.indicators?.MTTF === 'true',
                mtta: rawReqQuery.indicators?.MTTA === 'true'
            }
        };

        // console.log(req.query);

        const query = {
            $and: [
                {name: {$regex: escapeRegExp(reqQuery.name), $options: 'i'}},
                reqQuery.indicators?.mtbf ? {$or: [{'details.mtbf': {$exists: true}}, {description: /mtbf/i}]} : {},
                reqQuery.indicators?.mttr ? {$or: [{'details.mttr': {$exists: true}}, {description: /mttr/i}]} : {},
                reqQuery.indicators?.mttf ? {$or: [{'details.mttf': {$exists: true}}, {description: /mttf/i}]} : {},
                reqQuery.indicators?.mtta ? {$or: [{'details.mtta': {$exists: true}}, {description: /mtta/i}]} : {}
            ]
        };

        const equipmentQuery = EquipmentModel.collection.find(query);
        const count = await equipmentQuery.count();
        const data = await equipmentQuery
            .skip((reqQuery.page - 1) * reqQuery.size)
            .limit(reqQuery.size)
            .toArray();

        res.status(200).json({count, data});
    } catch (e) {
        res.status(500);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const equipment = await EquipmentModel.findById(req.params.id);
        res.json(equipment);
    } catch (e) {
        res.status(500);
    }
});

export default router;
