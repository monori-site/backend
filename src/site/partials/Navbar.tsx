import { NormalProperties } from '../types';
import React from 'react';

function NavbarLink({ path, name }: { path: string, name: string }) {
  return <a className='navbar-item' href={path}>{name}</a>;
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
          {/* TODO: Add a dropdown here when finished */}
          {req.session ? <NavbarLink path='/login' name='Login' /> : <NavbarLink path='/users/@me' name={req.session!.user.username} />}
        </div>
      </div>
    </nav>
  );
}