import React from 'react';
import { Language } from '@patternfly/react-code-editor';
import { ExpandableSection, Grid, GridItem, TextInput } from '@patternfly/react-core';
import { useField } from 'formik';
import { OcmInputField, OcmCodeField } from '../../../ui/OcmFormFields';
import { CustomManifestValues } from '../data/dataTypes';
import { FolderDropdown } from './FolderDropdown';
import { CustomManifestComponentProps } from './propTypes';
import { DEBOUNCE_TIME_CODEFIELD } from '../../../../config';

const getDownloadFileName = (manifestIdx: number, value: CustomManifestValues) => {
  return value.folder && value.filename
    ? `${value.folder}/${value.filename.replace('.yaml', '')}`
    : `custom_manifest_${manifestIdx}`;
};

const ExpandedManifest = ({ fieldName, manifestIdx }: CustomManifestComponentProps) => {
  const [{ value }] = useField<CustomManifestValues>({
    name: fieldName,
  });

  return (
    <ExpandableSection isDetached key={manifestIdx} isExpanded>
      <Grid hasGutter span={12}>
        <GridItem span={6}>
          <TextInput
            hidden={true}
            name={`${fieldName}.fakeId`}
            data-testid={`fakeId-${manifestIdx}`}
            id={`fakeId-${manifestIdx}`}
          />
          <FolderDropdown name={`${fieldName}.folder`} data-testid={`folder-${manifestIdx}`} />
        </GridItem>
        <GridItem span={6}>
          <OcmInputField
            name={`${fieldName}.filename`}
            label="File name"
            isRequired
            data-testid={`filename-${manifestIdx}`}
            helperText={
              'File name determines order of executing manifests during the installation. For example "manifest1.yaml" will be applied before "manifest2.yaml"'
            }
          />
        </GridItem>
        <GridItem span={12}>
          <OcmCodeField
            language={Language.yaml}
            name={`${fieldName}.manifestYaml`}
            dataTestid={`yamlContent-${manifestIdx}`}
            label="Content"
            isRequired
            downloadFileName={getDownloadFileName(manifestIdx, value)}
            debounceTime={DEBOUNCE_TIME_CODEFIELD}
          />
        </GridItem>
      </Grid>
    </ExpandableSection>
  );
};

export default ExpandedManifest;
