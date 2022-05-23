// // import fs from 'fs';
// import {Adapter} from 'src/parser/adapters/types';
// import {autoScroll} from 'src/parser/utils/auto-scroll';
// import {openNewPage, evaluateWindowFunctions, domChangeObserver} from 'src/parser/utils/page';
// import {getReliabilityParameters} from 'src/parser/lib/reliability-parameters';
// import {login} from 'src/parser/adapters/dir.indiamart.com/login';
// import EquipmentService from 'src/db/services/equipment';
// import EquipmentModel, {IEquipmentSchema} from 'src/db/models/equipment';
// import {ICompanySchema} from 'src/db/models/company';
// import mongoose from 'mongoose';
// import logger from 'src/parser/winston';
// import {map} from 'lodash';
// // import {EquipmentModel} from 'src/models/equipment';

// async function adapter(...[browser, url]: Parameters<Adapter>) {
//     const page = await openNewPage(browser, url);

//     const categoriesLinks = await page.$$eval('.left-menu a', (elems) =>
//         elems.map((el) => el.attributes.getNamedItem('href')?.value).filter(Boolean)
//     );

//     // for (const url of subCategoriesLinks.slice(0, 1)) {
//     for (const url of categoriesLinks) {
//         try {
//             await parseCategoryPage(browser, url);
//         } catch (err) {
//             logger.error('Error when parsing subcategory page', {err: err instanceof Error ? err.message : err, url});
//         }
//     }

//     // await page.close();

//     // fs.writeFileSync('data.json', JSON.stringify(scrapedData));
// }

// export {adapter};
