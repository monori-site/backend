import { existsSync, promises as fs } from 'fs';
import { createLogger } from '@augu/logging';
import { Website } from '../core';
import { join } from 'path';

const URL = 'https://raw.githubusercontent.com/Semantic-Org/Semantic-UI/master/dist/semantic.min.css';
const logger = createLogger('SemanticUI');

export default async function downloadSemantic(this: Website, base: string) {
  const directory = join(base, 'static', 'css');
  if (existsSync(join(directory, 'style.css'))) {
    logger.warn('Semantic UI is already downloaded, skipping...');
    return;
  }

  logger.info(`Now downloading Semantic UI in directory ${directory}`);

  try {
    const res = await this.http.request({
      url: URL,
      method: 'get',
      headers: {
        'Content-Type': 'text/css'
      }
    });

    const data = res.text();
    await fs.writeFile(join(directory, 'style.css'), data);
    logger.info(`Wrote a file in ${join(directory, 'style.css')}!`);
  } catch (ex) {
    logger.error('Unable to write file, possibily GitHub is down?', ex);
  }
}