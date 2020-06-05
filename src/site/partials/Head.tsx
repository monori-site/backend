import { NormalProperties } from '../types';
import React from 'react';

const defDesc = 'Simple and open-source translation site for everyone to use, for free.';
interface HeadProperties extends NormalProperties {
  description?: string;
  page: string;
}
export default function Head({ page, description }: HeadProperties) {
  return (
    <html>
      <head>
        <title>i18n | {page}</title>
        <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='stylesheet' href='/static/css/style.css' />
        <link rel='shortcut icon' href='/static/images/icon.png' />
        <link rel='icon' href='/static/images/icon.png' />
        <meta name='theme-color' content={website.config.color} />
        {/* TODO: Find a way to get the URL */}
        <meta property='og:url' content='https://i18n.augu.dev' />
        <meta property='og:title' content={`i18n | ${page}`} />
        {/* TODO: Find a way to get the website URI */}
        <meta property='og:image' content='https://i18n.augu.dev/static/images/icon.png' />
        <meta property='og:description' content={description || defDesc} />
      </head>
    </html>
  );
}