import { Icon, Image, Menu, Sidebar, Responsive } from'semantic-ui-react';
import React from 'react';

interface NavbarState {
  visible: boolean;
}

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

function NavbarDesktop() {
  return (
    <Menu fixed='top' inverted>
      <Menu.Item>
        <Image size='mini' src={`http://localhost:${website.config.port}/static/images/icon.png`} />
      </Menu.Item>
    </Menu>
  );
}

export default class Navbar extends React.Component<Record<string, unknown>, NavbarState> {
  state = { visible: false };

  handleToggle() {
    if (this.state.visible) this.setState({ visible: false });
  }

  handlePush() {
    this.setState({ visible: !this.state.visible });
  }

  render() {
    return (
      <>
        <Responsive {...Responsive.onlyMobile}>
          <NavbarMobile
            onClick={this.handlePush}
            onToggle={this.handleToggle}
            visible={this.state.visible}
          ></NavbarMobile>
        </Responsive>

        <Responsive {...Responsive.onlyTablet.minWidth}>
          <NavbarDesktop></NavbarDesktop>
        </Responsive>
      </>
    );
  }
}