import { FullByteSizePipe } from './full-byte-size.pipe';

describe('FullByteSizePipe', () => {
  it('create an instance', () => {
    const pipe = new FullByteSizePipe();
    expect(pipe).toBeTruthy();
  });
});
