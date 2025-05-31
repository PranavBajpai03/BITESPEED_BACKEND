export interface Contact {
    id: number;
    phoneNumber: string | null;
    email: string | null;
    linkedId: number | null;
    linkPrecedence: 'primary' | 'secondary';
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    deletedAt: string | null; // ISO date string or null
}

export interface PostResponse {
    "contact": {
        primaryContactId: number;
        emails: string[],
        phoneNumbers: string[];
        secondaryContactIds: number[];
    }
}