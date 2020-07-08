import { Icon, Image, Menu, Sidebar, Responsive, Dropdown } from'semantic-ui-react';
import { NormalProperties } from '../types';
import React from 'react';

interface NavbarMobileProps {
  onToggle(): void;
  onClick(): void;
  visible: boolean;
}

function NavbarMobile({ onClick, onToggle, visible }: NavbarMobileProps) {
  // TODO: Get url
  const staticUrl = `http://localhost:${website.config.port}/static/images/icon.png`;

  return (
    <Sidebar.Pushable>
      <Sidebar
        as={Menu}
        animation='overlay'
        icon='labeled'
        inverted
        items={[]}
        vertical
        visible={visible}
      >
        <Sidebar.Pusher dimmed={visible} onClick={onClick} style={{ minHeight: '100vh' }}>
          <Menu fixed='top' inverted>
            <Menu.Item>
              <Image size='mini' src={staticUrl} />
            </Menu.Item>
            <Menu.Item onClick={onToggle}>
              <Icon name='sidebar' />
            </Menu.Item>
            <Menu.Menu position='right'>
              <Menu.Item as='a' content='Home' key='home' />
            </Menu.Menu>
          </Menu>
        </Sidebar.Pusher>
      </Sidebar>
    </Sidebar.Pushable>
  );
}

function NavbarDesktop({ res, req }: NormalProperties) {
  return (
    <Menu fixed='top' inverted>
      <Menu.Item>
        <Image size='mini' src={`http://localhost:${website.config.port}/static/images/icon.png`} />
      </Menu.Item>
      <Menu.Item as='a' onClick={() => res.redirect('/')} icon='home' content='Home' />
      <Menu.Item as='a' onClick={() => res.redirect('https://github.com/auguwu/i18n')} icon='github' content='GitHub' />
      <Menu.Item as='a' onClick={() => res.redirect('/hosting')} icon='folder open' content='Host your own' />
      <UserProfile {...{ req, res }} />
    </Menu>
  );
}

function UserProfile({ req, res }: NormalProperties) {
  if (req.session.user) {
    return <Menu.Menu position='right'>
      <Dropdown trigger={<span>{req.session.user.username}</span>} options={[
        {
          disabled: true,
          icon: 'address card',
          key: 'user',
          text: (
            <span>Signed in as <strong>{req.session.user.username}</strong></span>
          )
        },
        {
          key: 'profile',
          text: 'View Profile',
          onClick: () => res.redirect('/users/@me')
        },
        {
          key: 'repos',
          text: 'View Repositories',
          onClick: () => res.redirect('/users/@me/repositories')
        },
        {
          key: 'orgs',
          text: 'View Organisations',
          onClick: () => res.redirect('/users/@me/organisations')
        }
      ]} />
    </Menu.Menu>;
  } else {
    return <Menu.Menu position='right'>
      <Menu.Item as='a' href='/login' content='Login' icon='address card outline' />
    </Menu.Menu>;
  }
}

export default function Navbar({ res, req }: NormalProperties) {
  const [visible, setVisibility] = React.useState(false);

  const handleToggle = () => {
    if (visible) setVisibility(false);
  };

  const handlePush = () => {
    setVisibility(!visible);
  };

  return (
    <>
      <Responsive {...Responsive.onlyMobile}>
        <NavbarMobile
          onClick={handlePush}
          onToggle={handleToggle}
          visible={visible}
        ></NavbarMobile>
      </Responsive>

      <Responsive {...Responsive.onlyTablet.minWidth}>
        <NavbarDesktop {...{ res, req }}></NavbarDesktop>
      </Responsive>
    </>
  );
}