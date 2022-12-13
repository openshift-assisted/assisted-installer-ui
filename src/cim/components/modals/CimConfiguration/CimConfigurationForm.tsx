import * as React from 'react';
import { Trans } from 'react-i18next';
import {
  Flex,
  FlexItem,
  Form,
  FormGroup,
  Popover,
  Checkbox,
  TextInput,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, HelpIcon } from '@patternfly/react-icons';

import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { CimConfigurationFormProps } from './types';

import './CimConfigurationForm.css';

export const CimConfigurationForm: React.FC<CimConfigurationFormProps> = ({
  docConfigUrl,
  docConfigAwsUrl,
  isEdit,
  isInProgressPeriod,

  dbVolSize,
  dbVolSizeValidation,
  setDbVolSize,
  fsVolSize,
  fsVolSizeValidation,
  setFsVolSize,
  imgVolSize,
  imgVolSizeValidation,
  setImgVolSize,
  configureLoadBalancer,
  configureLoadBalancerInitial,
  setConfigureLoadBalancer,
}) => {
  const { t } = useTranslation();

  const getNumber = (v: string, min: number): number => {
    const p = parseFloat(v);
    if (isNaN(p)) {
      // Do not check for minimum here - keep it on validation
      return min;
    }
    return p;
  };

  const awsHelp = (
    <Popover
      bodyContent={t(
        "ai:If you're running your hub cluster of Amazon Web Services and want to enable the CIM service, we recommend you to configure your load balancer if it is not already configured. Learn more about enabling CIM on AWS.",
      )}
      footerContent={
        <a href={docConfigAwsUrl} target="_blank" rel="noreferrer">
          <Trans t={t}>
            ai:Learn more about enabling CIM on AWS <ExternalLinkAltIcon />
          </Trans>
        </a>
      }
    >
      <button
        type="button"
        aria-label={t('ai:More info for load balancer on Amazon web services')}
        aria-describedby="cim-config-form-aws-title"
        onClick={(e) => e.preventDefault()}
        className="pf-c-form__group-label-help"
      >
        <HelpIcon noVerticalAlign />
      </button>
    </Popover>
  );

  return (
    <Form>
      <FormGroup
        fieldId="cim-config-form-storage-title"
        label={t('ai:Storage sizes')}
        className="cim-config-form-title"
        labelIcon={
          <Popover
            bodyContent={t(
              'ai:The storage sizes will be used to store different files and data for cluster creation.',
            )}
            footerContent={
              <a href={docConfigUrl} target="_blank" rel="noreferrer">
                <Trans t={t}>
                  ai:Learn more about storage sizes. <ExternalLinkAltIcon />
                </Trans>
              </a>
            }
          >
            <button
              type="button"
              aria-label={t('ai:More info for configure storage sizes')}
              aria-describedby="cim-config-form-storage-title"
              onClick={(e) => e.preventDefault()}
              className="pf-c-form__group-label-help"
            >
              <HelpIcon noVerticalAlign />
            </button>
          </Popover>
        }
      >
        {t('ai:If there are many clusters, use higher values for the storage fields.')}
      </FormGroup>
      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
        <FlexItem>
          <FormGroup
            label={t('ai:Database storage')}
            fieldId="cim-config-form-storage-db"
            labelIcon={
              <Popover
                bodyContent={t(
                  'ai:Specify how much storage is allocated for storing files such as database tables and database views for the clusters. Recommended is 10Gi or more. The value can not be updated later.',
                )}
              >
                <button
                  type="button"
                  aria-label={t('ai:More info for database storage')}
                  aria-describedby="cim-config-form-storage-db"
                  onClick={(e) => e.preventDefault()}
                  className="pf-c-form__group-label-help"
                >
                  <HelpIcon noVerticalAlign />
                </button>
              </Popover>
            }
            helperTextInvalid={dbVolSizeValidation}
            validated={dbVolSizeValidation ? 'error' : 'default'}
            isRequired
          >
            <span className="cim-config-form-volume">
              <TextInput
                isRequired
                isDisabled={isEdit /* Not supported by backend */}
                type="number"
                id="cim-config-form-storage-db"
                name="cim-config-form-storage-db"
                value={dbVolSize}
                onChange={(v: string) => setDbVolSize(getNumber(v, 1))}
                min={0 /* Do the validation elsewhere */}
              />{' '}
              Gi
            </span>
          </FormGroup>
        </FlexItem>
        <FlexItem>
          <FormGroup
            label={t('ai:System storage')}
            fieldId="cim-config-form-storage-sys"
            labelIcon={
              <Popover
                bodyContent={t(
                  'ai:Specify how much storage is allocated for storing logs, manifests and "kubeconfig" files for the clusters. Recommended is 100Gi or more. The value can not be updated later.',
                )}
              >
                <button
                  type="button"
                  aria-label={t('ai:More info for system storage')}
                  aria-describedby="cim-config-form-storage-sys"
                  onClick={(e) => e.preventDefault()}
                  className="pf-c-form__group-label-help"
                >
                  <HelpIcon noVerticalAlign />
                </button>
              </Popover>
            }
            helperTextInvalid={fsVolSizeValidation}
            validated={fsVolSizeValidation ? 'error' : 'default'}
            isRequired
          >
            <span className="cim-config-form-volume">
              <TextInput
                isRequired
                isDisabled={isEdit /* Not supported by backend */}
                type="number"
                id="cim-config-form-storage-sys"
                name="cim-config-form-storage-sys"
                value={fsVolSize}
                onChange={(v: string) => setFsVolSize(getNumber(v, 1))}
                min={0}
              />{' '}
              Gi
            </span>
          </FormGroup>
        </FlexItem>
        <FlexItem>
          <FormGroup
            label={t('ai:Image storage')}
            fieldId="cim-config-form-storage-img"
            labelIcon={
              <Popover
                bodyContent={t(
                  'ai:Specify how much storage to allocate for the images of the clusters. There must be 1G of image storage for each instance of Red Hat Enterprise Linux CoreOS that is running. Recommended is 50Gi or more. The value can not be updated later.',
                )}
              >
                <button
                  type="button"
                  aria-label={t('ai:More info for image storage')}
                  aria-describedby="cim-config-form-storage-img"
                  onClick={(e) => e.preventDefault()}
                  className="pf-c-form__group-label-help"
                >
                  <HelpIcon noVerticalAlign />
                </button>
              </Popover>
            }
            helperTextInvalid={imgVolSizeValidation}
            validated={imgVolSizeValidation ? 'error' : 'default'}
            isRequired
          >
            <span className="cim-config-form-volume">
              <TextInput
                isRequired
                isDisabled={isEdit /* Not supported by backend */}
                type="number"
                id="cim-config-form-storage-img"
                name="cim-config-form-storage-img"
                value={imgVolSize}
                onChange={(v: string) => setImgVolSize(getNumber(v, 10))}
                min={0}
              />{' '}
              Gi
            </span>
          </FormGroup>
        </FlexItem>
      </Flex>

      <Checkbox
        label={
          <span className="cim-config-form-aws-label">
            {t('ai:Configure load balancer on Amazon Web Services for me.')}
            &nbsp;
            {awsHelp}
          </span>
        }
        id="cim-config-form-aws"
        className="cim-config-form-aws"
        // isRequired
        name="aws-loadbalancer-checkbox"
        isChecked={configureLoadBalancer}
        isDisabled={
          isInProgressPeriod ||
          (isEdit &&
            configureLoadBalancerInitial) /* For edit flow, only No to Yes transition is possible */
        }
        onChange={setConfigureLoadBalancer}
      />
    </Form>
  );
};
