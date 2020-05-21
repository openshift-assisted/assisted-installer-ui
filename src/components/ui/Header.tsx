import React from 'react';
import { Brand, PageHeader } from '@patternfly/react-core';

// TODO(mlibra) Uncomment! Temporary workaround
// import logo from '../../images/metal3_facet-whitetext.svg';
const logo = () => <div />;

const Header: React.FC = () => (
  <PageHeader
    logo={<Brand src={logo} alt="Metal&sup3; Facet UI" />}
    // toolbar={PageToolbar}
    //avatar={<Avatar src={avatarImg} alt="Avatar image" />}
    showNavToggle
    // onNavToggle={this.onNavToggle}
  />
);

export default Header;
