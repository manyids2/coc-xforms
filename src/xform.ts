// taken from coc-bookmarks
import { workspace, Neovim, Uri } from 'coc.nvim';
import XformDB from './db';

export default class Xform {
  constructor(private nvim: Neovim, private db: XformDB) {}

  public async create(): Promise<void> {
    const xformname: string = await workspace.requestInput('xformname');
    const xformstr: string = await workspace.requestInput('xformstr');
    await this.db.push(xformname, xformstr);
  }
}

export interface XformItem {
  xformname: string;
  xformstr: string;
}
