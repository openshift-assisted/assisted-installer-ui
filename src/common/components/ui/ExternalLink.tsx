import React, { ReactNode } from 'react';
import { Text } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

interface ExternalLinkProps {
  href?: string;
  onClick?: VoidFunction;
  children?: ReactNode;
}
const ExternalLink: React.FC<ExternalLinkProps> = ({ href, children, onClick }) => (
  <Text component="a" href={href} onClick={onClick} target="_blank" rel="noopener noreferrer">
    {children ? children : href} <ExternalLinkAltIcon color="rgb(0, 123, 186)" />
  </Text>
);
export default ExternalLink;
