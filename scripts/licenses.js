/**
 * ☔ Arisu: Translation made with simplicity, yet robust. Made with 💖 using TypeScript and Go.
 * Copyright (C) 2020-2021 Noelware
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const { readdirSync, statSync, readFileSync } = require('fs');
const path = require('path');
const fs = require('fs/promises');

const main = async() => {
  const licenseFile = await fs.readFile('../assets/HEADER', { encoding: 'utf8' })
    .then(l => l.replace('{{present}}', new Date().getFullYear().toString()));

  const projects = [
    'backend',
    'frontend'
  ];

  for (project of projects) {
    const files = readdir(`../${project}/src`).filter(file => file.endsWith('.ts'));
    for (file of files) {
      const contents = readFileSync(file).toString('utf-8');
      const newContents = [
        licenseFile,
        '',
        ...contents,
        ''
      ];

      console.log(`✔ ${file}`);
      await fs.writeFile(file, newContents.join('\n'));
    }
  }

  return 0;
};

const readdir = (dir) => {
  let results = [];
  const files = readdirSync(dir);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fullPath = path.join(path, file);

    // doesn't de-reference symbolic links
    const stats = statSync(fullPath);
    const isFile = (stats.isFile() || stats.isFIFO());

    // Check if it's a directory
    if (!isFile) {
      const files = readdirSync(fullPath, options);
      results = results.concat(files);
    } else {

      results.push(fullPath);
    }
  }

  return files;
};

main()
  .then((code) => process.exit(code))
  .catch(ex => {
    console.error(ex);
    process.exit(1);
  });
