import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Flex, FlexItem, Form, FormGroup, Popover, Radio, TextInput } from '@patternfly/react-core';
import { ExternalLinkAltIcon, HelpIcon } from '@patternfly/react-icons';

import { CimConfigurationFormProps } from './types';

import './CimConfigurationForm.css';

// TODO: https://miro.com/app/board/uXjVPM4GkzQ=/?moveToWidget=3458764538969838424&cot=14
// TODO: Update minimums:
//  - https://github.com/stolostron/rhacm-docs/pull/4371
//  - https://github.com/stolostron/rhacm-docs/issues/4372
export const CimConfigurationForm: React.FC<CimConfigurationFormProps> = ({
  docConfigUrl,
  isEdit,

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

  return (
    <Form>
      <FormGroup
        fieldId="cim-config-form-storage-title"
        label={t('ai:Configure storage sizes')}
        className="cim-config-form-title"
        labelIcon={
          <Popover
            bodyContent={t(
              'ai:The storage sizes will be used to store different files and data for cluster creation. Learn more about storage sizes.',
            )}
            footerContent={
              <a href={docConfigUrl} target="_blank">
                <Trans t={t}>
                  ai:View documentation <ExternalLinkAltIcon />
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
        {t('ai:If there are many clusters, use a higher values for the storage fields.')}
      </FormGroup>

      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
        <FlexItem>
          <FormGroup
            label={t('ai:Database storage')}
            fieldId="cim-config-form-storage-db"
            labelIcon={
              <Popover
                bodyContent={t(
                  'ai:Specify how much storage is allocated for storing files such as database tables and database views for the clusters. Recommended is 10G or more. The value can not be updated later.',
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
              />
              G
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
                  'ai:Specify how much storage is allocated for storing logs, manifests and "kubeconfig" files for the clusters. The value can not be updated later.',
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
              />
              G
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
                  'ai:Specify how much storage to allocate for the images of the clusters. There must be 1G of image storage for each instance of Red Hat Enterprise Linux CoreOS that is running',
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
              />
              G
            </span>
          </FormGroup>
        </FlexItem>
      </Flex>

      <FormGroup
        fieldId="cim-config-form-aws-title"
        label={t('ai:Configure load balancer on Amazon web services')}
        className="cim-config-form-title"
        labelIcon={
          <Popover
            bodyContent={t(
              "ai: If you're running your hub cluster of Amazon Web Services and want to enable the CIM service, we recommend you to configure your load balance if it is not already configured.",
            )}
            footerContent={
              <a href={docConfigUrl} target="_blank">
                <Trans t={t}>
                  ai:View documentation <ExternalLinkAltIcon />
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
        }
      />

      <FormGroup
        fieldId="cim-config-form-aws-yes"
        className="cim-config-form-aws"
        label={t('ai:Do you want to configure load balancer on AWS?')}
      >
        <Flex>
          <FlexItem>
            <Radio
              isChecked={configureLoadBalancer}
              onChange={() => setConfigureLoadBalancer(true)}
              label={t('ai:Yes')}
              id="cim-config-form-aws-yes"
              name="cim-config-form-aws-yes"
            />
          </FlexItem>
          <FlexItem>
            <Radio
              isChecked={!configureLoadBalancer}
              onChange={() => setConfigureLoadBalancer(false)}
              label={t('ai:No')}
              id="cim-config-form-aws-no"
              name="cim-config-form-aws-no"
            />
          </FlexItem>
        </Flex>
      </FormGroup>
    </Form>
  );
};
