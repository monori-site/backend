import { AppBar, Typography, Menu, MenuItem, Toolbar, Button, IconButton } from '@material-ui/core';
import type { NormalProperties, Response } from '../types';
import { makeStyles } from '@material-ui/core/styles';
import { GitHub } from '@material-ui/icons';
import React from 'react';

const useStyles = makeStyles(theme => ({
  grow: { flexGrow: 1 },
  menuButton: { marginRight: theme.spacing(2) },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: { display: 'block' }
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: { display: 'flex' }
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: { display: 'none' }
  }
}));

/*function Profile({ res }: { res: Response }) {
  const [anchor, setAnchor] = React.useState<any>(null);

  const handleMenuOpen = (event: any) => setAnchor(event.currentTarget);
  const handleMenuClose = () => setAnchor(null);

  const redirect = (event: any, type: 'profile' | 'settings' | 'org' | 'project') => {
    handleMenuOpen(event);

    let url: string;
    switch (type) {
      case 'profile': {
        url = '/users/@me';
      } break;

      case 'settings': {
        url = '/users/settings';
      } break;

      case 'org': {
        url = '/users/organisations';
      } break;

      case 'project': {
        url = '/users/projects';
      } break;

      default: return;
    }

    res.redirect(url);
  };

  return <Menu
    anchorEl={anchor}
    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    id={'menu-id'}
    keepMounted
    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    open={Boolean(anchor)}
    onClose={handleMenuClose}
  >
    <MenuItem onClick={(event) => redirect(event, 'profile')}>Profile</MenuItem>
    <MenuItem onClick={(event) => redirect(event, 'settings')}>Settings</MenuItem>
    <MenuItem onClick={(event) => redirect(event, 'org')}>Organisations</MenuItem>
    <MenuItem onClick={(event) => redirect(event, 'project')}>Projects</MenuItem>
  </Menu>;
}

function ProfileMobile({ res }: { res: Response }) {
  const [anchor, setAnchor] = React.useState<any>(null);

  const handleMenuOpen = (event: any) => setAnchor(event.currentTarget);
  const handleMenuClose = () => setAnchor(null);

  const redirect = (event: any, type: 'profile' | 'settings' | 'org' | 'project') => {
    handleMenuOpen(event);

    let url: string;
    switch (type) {
      case 'profile': {
        url = '/users/@me';
      } break;

      case 'settings': {
        url = '/users/settings';
      } break;

      case 'org': {
        url = '/users/organisations';
      } break;

      case 'project': {
        url = '/users/projects';
      } break;

      default: return;
    }

    res.redirect(url);
  };

  return <Menu
    anchorEl={anchor}
    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    id={'mobile-menu-id'}
    keepMounted
    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    open={Boolean(anchor)}
    onClose={handleMenuClose}
  >
    <MenuItem onClick={(event) => redirect(event, 'profile')}>Profile</MenuItem>
    <MenuItem onClick={(event) => redirect(event, 'settings')}>Settings</MenuItem>
    <MenuItem onClick={(event) => redirect(event, 'org')}>Organisations</MenuItem>
    <MenuItem onClick={(event) => redirect(event, 'project')}>Projects</MenuItem>
  </Menu>;
}*/

// Element is taken from the navbar example, might refine it soon
export default function Navbar({ req, res }: NormalProperties) {
  const classes = useStyles();

  return <div className={classes.grow}>
    <AppBar position='static'>
      <Toolbar>
        <Typography className={classes.title} variant='h6' noWrap>i18n</Typography>
        <IconButton aria-label='GitHub URL' color='inherit' onClick={() => res.redirect('https://github.com/auguwu/i18n')}>
          <GitHub />
        </IconButton>
      </Toolbar>
    </AppBar>
  </div>;
}