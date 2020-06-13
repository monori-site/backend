import { ThemeProvider, CssBaseline } from '@material-ui/core';
import type { NormalProperties } from '../types';
import getMuiTheme from '../types/theme';
import Navbar from './Navbar';
import Footer from './Footer';
import React from 'react';
import Head from './Head';

type ReactiveChildren = (React.ReactNode[] | JSX.Element);
interface LayoutProperties extends NormalProperties {
  description?: string;
  children?: ReactiveChildren;
  isLogin?: boolean;
  page: string;
}

interface LayoutTreeProperties extends NormalProperties {
  children?: ReactiveChildren;
  isLogin?: boolean;
}

function LayoutTree({ isLogin, children, req, res }: LayoutTreeProperties) {
  if (isLogin) {
    return <>
      {children}
    </>;
  } else {
    return <>
      <Navbar {...{ req, res }} />
      {children}
      <Footer />
    </>;
  }
}

export default function Layout({ children, page, description, req, res, isLogin }: LayoutProperties) {
  const theme = getMuiTheme(req);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Head
        page={page} 
        description={description} 
        req={req} 
        res={res} 
      />
      <body>
        <LayoutTree isLogin={isLogin} req={req} res={res}>
          {children}
        </LayoutTree>
      </body>
    </ThemeProvider>
  );
}