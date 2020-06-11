import { NormalProperties } from '../types';
import Layout from '../partials/Layout';
import React from 'react';

export default function Login(props: NormalProperties) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<Error | null>(null);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    website.log('warn', 'Now logging in...');
    website.http.request({
      method: 'post',
      url: `http://localhost:${website.config.port}/login/callback`
    })
      .body({
        username,
        password
      })
      .then(res => {
        const data = res.json();
        if (data.statusCode >= 200 || data.statusCode > 300) {
          website.log('fatal', `Unable to login user ${username}`);
          setError(new Error(`Unable to login user ${username}: ${data.message}`));
        }

        // Redirect the user
        props.res.redirect('/');
      })
      .catch(error => setError(error));
  };

  return <Layout
    req={props.req}
    res={props.res}
    page='/login'
    description='Login into your account'
    // Don't add the navbar/footer to give it that aesthetic
    isLogin={true}
  >
    <section className='hero is-primary is-fullheight'>
      <div className='hero-body'>
        <div className='container'>
          <div className='columns is-centered'>
            <div className='column is-5-tablet is-4-desktop is-3-widescreen'>
              <h1 className='title'>Login</h1>
              <form onSubmit={(event) => onSubmit(event)} className='box'>

              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  </Layout>;
}