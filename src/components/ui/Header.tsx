import React from 'react';
import { Brand, PageHeader, PageHeaderTools, Button, ButtonVariant } from '@patternfly/react-core';
import metal3FacetLogo from '../../images/metal3_facet-whitetext.png';
import redhatLogo from '../../images/Logo-Red_Hat-OpenShift_Container_Platform-B-Reverse-RGB.png';
import { getProductBrandingCode, FEEDBACK_FORM_LINK } from '../../config/constants';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

const getBrandingDetails = () => {
  switch (getProductBrandingCode()) {
    case 'redhat':
      return {
        logo: redhatLogo,
        alt: 'OpenShift Container Platform Assisted Installer',
        href: '/', // let's go to Clusters List
      };
    default:
      return {
        logo: metal3FacetLogo,
        alt: 'Metal&sup3; Facet UI',
        href: 'https://github.com/openshift-metal3/facet',
      };
  }
};

const Header: React.FC = () => {
  const branding = getBrandingDetails();
  const logoProps = { href: branding.href };
  return (
    <PageHeader
      logo={<Brand src={branding.logo} alt={branding.alt} />}
      logoProps={logoProps}
      headerTools={
        <PageHeaderTools>
          <Button
            variant={ButtonVariant.plain}
            onClick={() => window.open(FEEDBACK_FORM_LINK, '_blank', 'noopener noreferrer')}
          >
            Provide feedback <ExternalLinkAltIcon />
          </Button>
        </PageHeaderTools>
      }
      // toolbar={PageToolbar}
      //avatar={<Avatar src={avatarImg} alt="Avatar image" />}
      // showNavToggle
      // onNavToggle={this.onNavToggle}
    />
  );
};

export default Header;
