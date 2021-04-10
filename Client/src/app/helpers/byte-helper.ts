export class ByteHelper {
  public static formatBytes(bytes: number, decimals?: number) {
    if (bytes === 0) {
      return '0 B';
    }

    if (!decimals || decimals < 0) {
      decimals = 0;
    }

    const size = bytes > 1024 ? 'KB' : 'B';
    
    const formattedBytes = bytes > 1024 ? (bytes / 1024).toFixed(decimals) : bytes.toFixed(decimals);

    return parseFloat(formattedBytes).toLocaleString() + ' ' + size;
  }
}