import type { NormalProperties } from '../types';
import Navbar from './Navbar';
import Footer from './Footer';
import React from 'react';
import Head from './Head';

interface LayoutProperties extends NormalProperties {
  description?: string;
  children: (React.ReactNode[] | JSX.Element);
  isLogin?: boolean;
  page: string;
}

interface LayoutTreeProperties {
  children: any;
  isLogin?: boolean;
}

function LayoutTree({ isLogin, children }: LayoutTreeProperties) {
  if (isLogin) {
    return children;
  } else {
    return <>
      <Navbar />
      {children}
      <Footer />
    </>;
  }
}

export default function Layout({ children, page, description, req, res, isLogin }: LayoutProperties) {
  return (
    <html>
      <Head {...{ req, res, page, description }} />
      <body>
        <LayoutTree {...{ isLogin, children } } />
      </body>
    </html>
  );
}