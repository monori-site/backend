import { NormalProperties } from '../types';
import Navbar from './Navbar';
import Footer from './Footer';
import React from 'react';
import Head from './Head';

interface LayoutProperties extends NormalProperties {
  description?: string;
  children?: React.ReactNode;
  page: string;
}
export default function Layout({ children, page, description, req, res }: LayoutProperties) {
  return <html>
    <Head 
      page={page} 
      description={description} 
      req={req} 
      res={res} 
    />
    <body>
      <Navbar {...{ req, res } } />
      {children}
      <Footer />
    </body>
  </html>;
}