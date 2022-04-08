export class ByteHelper {
  public static formatBytes(bytes: number, decimals?: number) {
    if (!bytes)
      return '0 B';

    if (!decimals || decimals < 0)
      decimals = 0;

    return parseFloat(bytes > 1024 ? (bytes / 1024).toFixed(decimals) : bytes.toFixed(decimals)).toLocaleString() + ' ' + (bytes > 1024 ? 'KB' : 'B');
  }
}