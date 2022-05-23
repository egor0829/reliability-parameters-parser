import {waitAndClick} from 'src/utils/page';

const selectors = {
    authorizedUser: '.rmv.cpo.ico-usr.Hd_dib',
    loginPopup: '#user_sign_in',
    emailInput: 'input#email',
    termsCheckbox: '#trm1 #myCheckbox',
    submitButton: '#submtbtn',
    usePasswordButton: '#passwordbtn1',
    passwordInput: '#usr_pass'
};

// const userData = {
//     login: 'nmlapteva@yandex.ru',
//     password: '0131Rabbit01!'
// };

async function login(page: Puppeteer.Page) {
    await page.waitForSelector(selectors.loginPopup);
    await page.$eval(selectors.emailInput, (el) => ((el as HTMLInputElement).value = 'nmlapteva@yandex.ru'));
    await waitAndClick(page, selectors.termsCheckbox);
    await waitAndClick(page, selectors.submitButton);

    await page.waitForSelector(selectors.usePasswordButton);
    await waitAndClick(page, selectors.usePasswordButton);
    await page.waitForSelector(selectors.passwordInput);
    await page.$eval(selectors.passwordInput, (el) => ((el as HTMLInputElement).value = '0131Rabbit01!'));
    await waitAndClick(page, selectors.termsCheckbox);
    await waitAndClick(page, selectors.submitButton);
}

export {login};
