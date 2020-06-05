import React from 'react';

export default function Navbar() {
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
    </nav>
  );
}