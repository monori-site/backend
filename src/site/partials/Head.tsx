import type { NormalProperties } from '../types';
import React from 'react';

const prefixNames: { [x: string]: string } = {
  '/': 'Home',
  '/error': 'Error',
  '/login': 'Login',
  '/admin': 'Administration Panel',
  '/signup': 'Signup'
};

const defDesc = '👻 Simple and open-source translation site for everyone to use, for free.';
interface HeadProperties extends NormalProperties {
  description?: string;
  page: string;
}

export default function Head({ page, description }: HeadProperties) {
  return (
    <head>
      <title>i18n | {prefixNames[page] || 'Unknown'}</title>
      <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
      <meta name='viewport' content='width=device-width, initial-scale=1' />
      <link rel='shortcut icon' href='/static/images/icon.png' />
      <link rel='icon' href='/static/images/icon.png' />
      <link rel='stylesheet' href='/static/css/style.css' />
      <link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap' />
      <meta name='theme-color' content={website.config.color} />
      <meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width' />
      {/* TODO: Find a way to get the URL */}
      <meta property='og:url' content='https://i18n.augu.dev' />
      <meta property='og:title' content={`i18n | ${prefixNames[page] || 'Unknown'}`} />
      {/* TODO: Find a way to get the website URI */}
      <meta property='og:image' content='https://i18n.augu.dev/static/images/icon.png' />
      <meta property='og:description' content={description || defDesc} />
    </head>
  );
}