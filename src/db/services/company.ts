import CompanyModel, {ICompanySchema} from 'src/db/models/company';

class CompanyService {
    static async saveOrUpdate(company: ICompanySchema) {
        return CompanyModel.findOneAndUpdate<ICompanySchema>({name: company.name}, company, {
            new: true,
            upsert: true,
            returnDocument: 'after'
        });
    }
}

export default CompanyService;
