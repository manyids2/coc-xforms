import {
  commands,
  CompleteResult,
  ExtensionContext,
  listManager,
  sources,
  events,
  workspace,
  OutputChannel,
} from 'coc.nvim';
import mkdirp from 'mkdirp';
import path from 'path';

import XformList from './lists';
import XformDB from './db';
import { fsStat, fsMkdir } from './fs';
import Xform from './xform';

export async function activate(context: ExtensionContext): Promise<void> {
  let { subscriptions } = context;
  const { nvim } = workspace;
  const config = workspace.getConfiguration('coc-xform');
  const channel: OutputChannel = workspace.createOutputChannel('xform');
  channel.appendLine(`coc-xform: OutputChannel created`);
  // if (!config.enabled) return;

  // Get config variables.
  const basedir: string = config.get<string>('basedir')!.toString();
  channel.appendLine(`coc-xform.basedir: ${basedir}`);

  const db = new XformDB(path.join(basedir, 'xforms.json'));
  const xform = new Xform(nvim, db);

  // Create xform.
  subscriptions.push(commands.registerCommand('xform.create', async () => await xform.create()));

  // Create xforms list.
  subscriptions.push(listManager.registerList(new XformList(nvim, db, channel)));
}
