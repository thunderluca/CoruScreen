export class GroupOf<T> {
    public key: string;
    public items: T[];

    constructor(key: string, items: T[]) {
        this.key = key;
        this.items = items;
    }
}