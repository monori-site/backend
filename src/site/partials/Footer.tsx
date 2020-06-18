import React from 'react';

export default function Footer() {
  const year = new Date().getFullYear();
  const time = year === 2020 ? '2020' : `2020-${year}`;

  // Don't do `2020-2020` since it'll look inconcise
  return (
    <div className='ui inverted vertical footer segment'>
      <div className='ui center aligned container'>
        <p style={{ color: 'white' }}>
          Copyright &copy; <a href='https://augu.dev'>August (Chris)</a> {time}
        </p>
      </div>
    </div>
  );
}