import type { NormalProperties, Request } from '../types';
import React from 'react';

function NavbarLink({ path, name }: { path: string, name: string }) {
  let uri!: string;
  
  // TODO: Get the URL from the browser
  if (path.startsWith('/')) uri = `http://localhost:${website.config.port}${path}`;
  else uri = path;

  return <a className='navbar-item' href={uri}>{name}</a>;
}

function NavbarDropdown({ req }: { req: Request }) {
  if (req.session.user) {
    return <div className='navbar-item has-dropdown is-hoverable'>
      <NavbarLink path={`/users/${req.session.user.username}`} name={req.session.user.username} />
      <div className='navbar-dropdown'>
        <NavbarLink path={`/organisations/${req.session.user.username}`} name='Your Organisations' />
        <NavbarLink path={`/projects/${req.session.user.username}`} name='Your projects' />
        <hr className='navbar-divider' />
        <NavbarLink path={`/users/${req.session.user.username}/settings`} name='Settings' />
      </div>
    </div>;
  } else {
    return <NavbarLink path='/login' name='Login' />;
  }
}

export default function Navbar({ req }: NormalProperties) {
  return (
    <nav className='navbar' role='navigation' aria-label='main navigation'>
      <div className='navbar-brand'>
        <a className='navbar-item is-cursive' href='/'>i18n</a>
        <a
          role='button'
          className='navbar-burger burger'
          aria-label='menu'
          aria-expanded='false'
          data-target='abcd'
        >
          <span aria-hidden='true'></span>
          <span aria-hidden='true'></span>
          <span aria-hidden='true'></span>
        </a>
      </div>
      <div id='abcd' className='navbar-menu'>
        <div className='navbar-start'>
          <NavbarLink path='/' name='Home' />
          <NavbarLink path='/docs' name='Documentation' />
          <NavbarLink path='https://github.com/auguwu/i18n' name='GitHub' />
        </div>
        <div className='navbar-end'>
          <NavbarDropdown req={req} />
        </div>
      </div>
    </nav>
  );
}