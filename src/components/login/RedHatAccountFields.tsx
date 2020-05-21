import React from 'react';
import { TextContent, Text, TextInputTypes } from '@patternfly/react-core';

import ExternalLink from '../ui/ExternalLink';
import { InputField } from '../ui/formik';

interface RedHatAccountFieldsProps {
  onProvidePullSecret: () => void;
}

const RedHatAccountFields: React.FC<RedHatAccountFieldsProps> = ({ onProvidePullSecret }) => (
  <>
    <TextContent>
      <Text component="p">
        Provide your Red Hat Account credentials to download necessary resources from{' '}
        <ExternalLink href="https://try.openshift.com/">try.openshift.com</ExternalLink> . You can
        also{' '}
        <Text component="a" onClick={onProvidePullSecret}>
          provide a Pull Secret
        </Text>{' '}
        instead.
      </Text>
    </TextContent>
    <InputField label="Username" name="username" isRequired />
    <InputField label="Password" name="password" type={TextInputTypes.password} isRequired />
  </>
);
export default RedHatAccountFields;
