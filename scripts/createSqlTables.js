#!/usr/bin/env node
// Script to make a .sql file to create the tables
/* eslint-disable camelcase */

const { existsSync, writeFileSync, mkdirSync, unlinkSync } = require('fs');
const { pipelines } = require('@augu/maru');
const { join } = require('path');

const FORMAT_VERSION = '1.1';
const args = process.argv.slice(2);
const name = args[0] || 'monori';

if (args[0] === 'help') {
  console.log('This script basically helps you manage the database for Monori');
  console.log('Usage: ./scripts/createSqlTables [name]');
  console.log(`Format Version: ${FORMAT_VERSION}`);
  process.exit(0);
}

const database = pipelines.CreateDatabase(name);
const organisations = pipelines.CreateTable('organisations', {
  exists: true,
  schema: {
    permissions: {
      nullable: false,
      primary: false,
      type: 'object'
    },
    created_at: {
      nullable: false,
      primary: false,
      type: 'date'
    },
    projects: {
      nullable: false,
      primary: false,
      array: true,
      type: 'string'
    },
    members: {
      nullable: false,
      primary: false,
      type: 'string'
    },
    github: {
      nullable: true,
      primary: false,
      type: 'string'
    },
    owner: {
      nullable: false,
      primary: false,
      type: 'string'
    },
    name: {
      nullable: false,
      primary: false,
      type: 'string'
    },
    id: {
      nullable: false,
      primary: true,
      type: 'string'
    }
  }
});

const projects = pipelines.CreateTable('projects', {
  exists: true,
  schema: {
    translations: { // {"en_US":"file or gh url"}
      nullable: false,
      primary: false,
      type: 'object'
    },
    completed: { // {"code":100} - example
      nullable: false,
      primary: false,
      type: 'object'
    },
    created_at: {
      nullable: false,
      primary: false,
      type: 'date'
    },
    github: {
      nullable: true,
      primary: false,
      type: 'string'
    },
    owner: {
      nullable: false,
      primary: false,
      type: 'string'
    },
    name: {
      nullable: false,
      primary: false,
      type: 'string'
    },
    id: {
      nullable: false,
      primary: true,
      type: 'string'
    }
  }
});

const users = pipelines.CreateTable('users', {
  exists: true,
  schema: {
    organisations: {
      nullable: false,
      primary: false,
      array: true,
      type: 'string'
    },
    contributor: {
      nullable: false,
      primary: false,
      type: 'boolean'
    },
    description: {
      nullable: false,
      primary: false,
      type: 'string'
    },
    translator: {
      nullable: false,
      primary: false,
      type: 'string'
    },
    projects: {
      nullable: false,
      primary: false,
      array: true,
      type: 'string'
    },
    username: {
      nullable: false,
      primary: false,
      type: 'string'
    },
    password: {
      nullable: false,
      primary: false,
      type: 'string'
    },
    created_at: {
      nullable: false,
      primary: false,
      type: 'date'
    },
    admin: {
      nullable: false,
      primary: false,
      type: 'boolean'
    },
    github: {
      nullable: true,
      primary: false,
      type: 'string'
    },
    email: {
      nullable: false,
      primary: false,
      type: 'string'
    },
    salt: {
      nullable: false,
      primary: false,
      type: 'string'
    },
    id: {
      nullable: false,
      primary: true,
      type: 'string'
    }
  }
});

console.log('* Creating file... (file may be changed, so refer to the `FORMAT_VERSION` comment to see if it\'s the latest one!)');
if (!existsSync(join(__dirname, '..', '.cache'))) mkdirSync(join(__dirname, '.cache'));
if (existsSync(join(__dirname, '..', '.cache', 'createTables.sql'))) unlinkSync(join(__dirname, '.cache', 'createTables.sql'));

const file = [
  '/*',
  `Format Version: ${FORMAT_VERSION}`,
  'To run this script, run `psql -f path_to_this_file`',
  '*/',
  database.getSql(),
  organisations.getSql(),
  projects.getSql(),
  users.getSql(),
  ''
];

writeFileSync(join(__dirname, '..', '.cache', 'createTables.sql'), file.join('\n'));
console.log(`+ File was created in ${join(__dirname, '..', '.cache', 'createTables.sql')}!`);
