import { PostResponse, Contact } from "./models";

const formatResponse = (primaryContactId: number, rows: Contact[]) : PostResponse => {
    let emails = new Set<string>();
    let phoneNumbers = new Set<string>();
    let secondaryContactIds: number[] = [];

    for (let row of rows) {
        if (row.email != null) emails.add(row.email);
        if (row.phoneNumber != null) phoneNumbers.add(row.phoneNumber);
        if (row.id !== primaryContactId) secondaryContactIds.push(row.id);
    }

    return {
        "contact": {
            "primaryContactId": primaryContactId,
            "emails": Array.from(emails.values()),
            "phoneNumbers": Array.from(phoneNumbers.values()),
            "secondaryContactIds": secondaryContactIds
        }
    }
}

export { formatResponse };