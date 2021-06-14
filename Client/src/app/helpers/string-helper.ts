export class StringHelper {
    public static nullOrWhiteSpace(str: string): boolean {
        return str === undefined || str === null || str.trim() === '';
    }
}