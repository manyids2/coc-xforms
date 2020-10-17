import XformDB from './db';
import { BasicList, ListAction, ListContext, ListItem, Neovim, workspace, OutputChannel } from 'coc.nvim';

export default class XformList extends BasicList {
  public readonly name = 'xform';
  public readonly description = 'CocList for xform';
  public readonly defaultAction = 'open';
  public actions: ListAction[] = [];
  public db: XformDB;
  public channel: OutputChannel;

  constructor(nvim: Neovim, db: XformDB, channel: OutputChannel) {
    super(nvim);
    this.db = db;
    this.channel = channel;
    this.channel.appendLine('Constructing xform lists.');

    this.addLocationActions();

    this.addAction('open', (item: ListItem) => {
      workspace.showMessage(`${item.label}, ${item.data.xform}`);
    });
  }

  public async loadItems(context: ListContext): Promise<ListItem[]> {
    let items: ListItem[] = [];
    const data = (await this.db.load()) as Object;
    for (let [xformname, xformstr] of Object.entries(data)) {
      this.channel.appendLine(`${xformname}: ${xformstr}`);
      items.push({
        label: xformname,
        data: { xform: xformstr, desc: 'something' },
      });
    }
    return items;
  }
}
