import {Router} from 'express';
import CompanyModel from 'src/db/models/company';
import {escapeRegExp} from 'src/server/utils/regexp';

const router = Router();

interface CompanyQuery {
    page?: number;
    size?: number;
    name?: string;
}

router.get<unknown, unknown, unknown, CompanyQuery>('/', async (req, res) => {
    try {
        const {page = 1, size = 10, name = ''} = req.query;
        console.log(page, size, name);
        const companies = await CompanyModel.find({name: {$regex: escapeRegExp(name), $options: 'i'}})
            .skip(page * size)
            .limit(size);
        console.log(companies.length);

        res.status(200).json(companies);
    } catch (e) {
        res.status(500);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const company = await CompanyModel.findById(req.params.id);
        res.json(company);
    } catch (e) {
        res.status(500);
    }
});

export default router;
