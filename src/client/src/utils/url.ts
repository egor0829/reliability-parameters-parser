function decoder(value: string): string | number | boolean | null | undefined {
    if (/^(\d+|\d*\.\d+)$/.test(value)) {
        return parseFloat(value);
    }

    const keywords: Record<string, boolean | null | undefined> = {
        true: true,
        false: false,
        null: null,
        undefined: undefined
    };
    if (value in keywords) {
        return keywords[value];
    }

    return value;
}

export {decoder};
