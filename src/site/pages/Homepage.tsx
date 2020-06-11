import { NormalProperties } from '../types';
import Layout from '../partials/Layout';
import React from 'react';

export default function Homepage({ req, res }: NormalProperties) {
  return <Layout req={req} res={res} page='/'>
    
  </Layout>;
}