import { NormalProperties } from '../types';
import Layout from '../partials/Layout';
import React from 'react';

export default function Homepage(props: NormalProperties) {
  return <Layout req={props.req} res={props.res} page='/'>
    <div>You lucky son of a bitch, you did it!</div>
  </Layout>;
}