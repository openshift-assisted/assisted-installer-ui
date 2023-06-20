import React, { ReactNode, MouseEvent } from 'react';
import { Text } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

interface ExternalLinkProps {
  href?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  children?: ReactNode;
}
const ExternalLink: React.FC<ExternalLinkProps> = ({ href, onClick, children }) => {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation(); // Stop event propagation here
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <Text component="a" href={href} onClick={handleClick} target="_blank" rel="noopener noreferrer">
      {children ? children : href} <ExternalLinkAltIcon color="rgb(0, 123, 186)" />
    </Text>
  );
};
export default ExternalLink;
