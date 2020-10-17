// modified from https://github.com/neoclide/coc.nvim/blob/master/src/model/db.ts
// taken from coc-bookmaarks
import path from 'path';
import { fsWriteFile, fsReadFile, fsMkdir, fsStat } from './fs';
import { promises as fsPromises } from 'fs';

export default class XformDB {
  constructor(private readonly filepath: string) {}

  public async load(): Promise<any> {
    const dir = path.dirname(this.filepath);
    const stat = await fsStat(dir);
    if (!stat?.isDirectory()) {
      await fsPromises.mkdir(this.filepath);
      await fsPromises.writeFile(this.filepath, '{}');
      return {};
    }
    try {
      const content = await fsReadFile(this.filepath);
      const data = JSON.parse(content.trim());
      return data;
    } catch {
      await fsWriteFile(this.filepath, '{}');
      return {};
    }
  }

  public async fetch(key: string): Promise<any> {
    let obj = await this.load();
    if (!key) return obj;
    let parts = key.split('.');
    for (let part of parts) {
      if (typeof obj[part] == 'undefined') {
        return undefined;
      }
      obj = obj[part];
    }
    return obj;
  }

  public async exists(key: string): Promise<boolean> {
    let obj = await this.load();
    let parts = key.split('.');
    for (let part of parts) {
      if (typeof obj[part] == 'undefined') {
        return false;
      }
      obj = obj[part];
    }
    return true;
  }

  public async push(key: string, data: any): Promise<void> {
    let origin = (await this.load()) || {};
    let obj = origin;
    let parts = key.split('.');
    let len = parts.length;
    if (obj == null) {
      let dir = path.dirname(this.filepath);
      await fsMkdir(dir);
      obj = origin;
    }
    for (let i = 0; i < len; i++) {
      let key = parts[i];
      if (i == len - 1) {
        obj[key] = data;
        await fsWriteFile(this.filepath, JSON.stringify(origin, null, 2));
        break;
      }
      if (typeof obj[key] == 'undefined') {
        obj[key] = {};
        obj = obj[key];
      } else {
        obj = obj[key];
      }
    }
  }

  public async delete(key: string): Promise<void> {
    let obj = await this.load();
    let origin = obj;
    let parts = key.split('.');
    let len = parts.length;
    for (let i = 0; i < len; i++) {
      if (typeof obj[parts[i]] == 'undefined') {
        break;
      }
      if (i == len - 1) {
        delete obj[parts[i]];
        await fsWriteFile(this.filepath, JSON.stringify(origin, null, 2));
        break;
      }
      obj = obj[parts[i]];
    }
  }

  public async clear(): Promise<void> {
    let stat = await fsStat(this.filepath);
    if (!stat?.isFile()) return;
    await fsWriteFile(this.filepath, '{}');
  }
}
