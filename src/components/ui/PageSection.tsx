import React, { CSSProperties } from 'react';
import { PageSection as PfPageSection, PageSectionVariants } from '@patternfly/react-core';

interface PageSectionProps extends React.ComponentProps<typeof PfPageSection> {
  isMain?: boolean;
  isWizard?: boolean;
  style?: CSSProperties;
}

const PageSection: React.FC<PageSectionProps> = ({
  isMain = false,
  isWizard = false,
  style,
  children,
  ...rest
}) => {
  const scrollableStyle: CSSProperties = React.useMemo(
    () => ({
      position: 'absolute',
      height: '100%',
      width: '100%',
      overflow: 'auto',
      zIndex: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: isWizard ? '' : 'var(--pf-global--spacer--lg)',
    }),
    [isWizard],
  );

  return (
    <PfPageSection
      style={{ ...style, position: 'relative' }}
      isFilled={isMain}
      padding={{ default: isMain ? 'noPadding' : 'padding' }}
      variant={PageSectionVariants.light}
      {...rest}
    >
      {isMain ? <div style={scrollableStyle}>{children}</div> : <>{children}</>}
    </PfPageSection>
  );
};

export default PageSection;
