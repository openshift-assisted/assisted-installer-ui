import type React from 'react';
import { useState } from 'react';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { AboutModal } from './AboutModal';

export const AboutButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCloseAboutModal = () => setIsModalOpen(false);
  const handleClick = () => setIsModalOpen(true);
  return (
    <>
      <Button variant={ButtonVariant.plain} onClick={handleClick} id="button-about">
        About
      </Button>
      <AboutModal isOpen={isModalOpen} onClose={handleCloseAboutModal} />
    </>
  );
};
