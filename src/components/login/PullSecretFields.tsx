import React from 'react';
import { TextContent, Text } from '@patternfly/react-core';

import ExternalLink from '../ui/ExternalLink';
import { TextAreaField } from '../ui/formik';

interface PullSecretFieldsProps {
  onProvideCredentials: () => void;
}

const PullSecretFields: React.FC<PullSecretFieldsProps> = ({ onProvideCredentials }) => (
  <>
    <TextContent>
      <Text component="p">
        Provide your Red Hat Account Pull Secret from{' '}
        <ExternalLink href="https://try.openshift.com/">try.openshift.com</ExternalLink> to download
        necessary resources. You can also{' '}
        <Text component="a" onClick={onProvideCredentials}>
          provide your credentials
        </Text>{' '}
        instead.
      </Text>
    </TextContent>
    <TextAreaField label="Pull secret" name="pullSecret" isRequired />
  </>
);
export default PullSecretFields;
