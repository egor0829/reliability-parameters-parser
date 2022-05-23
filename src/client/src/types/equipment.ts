interface Equipment extends Record<string, any> {
    _id: string;
    name: string;
    date?: string;
    details?: Record<string, any>;
    description?: string;
    imageUrl?: string;
    goodImageUrls?: string[];
    company?: string;
}

export type {Equipment};
