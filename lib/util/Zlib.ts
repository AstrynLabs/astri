export default class ZlibHelper {
  private zlib: any;
  private zlib_flush: any;

  init() {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
    return new Promise<boolean>(async (resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timeout while importing zlib-sync')), 1000);
      try {
        const { default: ZlibSync } = await import('zlib-sync');
        this.zlib = new ZlibSync.Inflate({
          chunkSize: 128 * 1024
        });
        this.zlib_flush = ZlibSync.Z_SYNC_FLUSH;
        resolve(true);
      } catch (error) {
        resolve(false);
      } finally {
        clearTimeout(timer);
      }
    });
  }

  push(buff: Buffer, flush: boolean) {
    if (!this.zlib) throw new Error('Trying to push with no zlib');
    this.zlib.push(buff, flush ? this.zlib_flush : false);
  }

  consume() {
    if (!this.zlib) throw new Error('Trying to consume with no zlib');
    return this.zlib.result as Buffer;
  }

  get err() {
    return this.zlib?.err;
  }

  get msg() {
    return this.zlib?.msg;
  }

  get enabled() {
    return this.zlib !== undefined;
  }
}
