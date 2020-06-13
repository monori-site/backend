import { Typography } from '@material-ui/core';
import React from 'react';

export default function Footer() {
  const year = new Date().getFullYear();
  const time = year === 2020 ? '2020' : `2020-${year}`;

  // Don't do `2020-2020` since it'll look inconcise
  return <Typography variant='body2' color='textSecondary' align='center'>
    Copyright &copy; August {time}
  </Typography>;
}