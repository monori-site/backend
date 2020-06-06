import { NormalProperties } from '../types';
import Layout from '../partials/Layout';
import React from 'react';

interface ErrorProperties extends NormalProperties {
  message: string;
  code: number;
}
export default function Error({ code, message, req, res }: ErrorProperties) {
  return <Layout req={req} res={res} page='/error' description={`[${code}]: ${message}`}>
    <p>Woah, what the fuck did you do this time? People are gonna be disappointed...</p>
    <br />
    <p>[{code}]: {message}</p>
  </Layout>;
}