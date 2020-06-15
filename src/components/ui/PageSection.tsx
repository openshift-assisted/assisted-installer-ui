import React, { CSSProperties } from 'react';
import { PageSection as PfPageSection } from '@patternfly/react-core';

interface PageSectionProps extends React.ComponentProps<typeof PfPageSection> {
  isMain?: boolean;
  style?: CSSProperties;
}

const scrollableStyle: CSSProperties = {
  position: 'absolute',
  height: '100%',
  width: '100%',
  overflow: 'auto',
  zIndex: 0,
  display: 'flex',
  flexDirection: 'column',
  padding: 'var(--pf-c-page__main-section--PaddingTop)',
};

const PageSection: React.FC<PageSectionProps> = ({ isMain = false, style, children, ...rest }) => (
  <PfPageSection
    style={{ ...style, position: 'relative' }}
    isFilled={isMain}
    padding={{ default: isMain ? 'noPadding' : 'padding' }}
    {...rest}
  >
    {isMain ? <div style={scrollableStyle}>{children}</div> : <>{children}</>}
  </PfPageSection>
);

export default PageSection;
