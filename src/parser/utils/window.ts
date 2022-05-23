function removeElements(selector: string): void {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
        element.parentNode?.removeChild(element);
    }
}

function delay(time: number) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}

const windowMethods = {
    removeElements,
    delay
};

type WindowMethods = typeof windowMethods;

export default windowMethods;
export {WindowMethods};
