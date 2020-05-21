import React from 'react';
import { BackgroundImage as PfBackgroundImage, BackgroundImageSrc } from '@patternfly/react-core';
/*
TODO(mlibra) Uncomment! Just temporary workaround while moving code to the library
import pfbg1200 from '@patternfly/patternfly/assets/images/pfbg_1200.jpg';
import pfbg768 from '@patternfly/patternfly/assets/images/pfbg_768.jpg';
import pfbg768at2x from '@patternfly/patternfly/assets/images/pfbg_768@2x.jpg';
import pfbg576 from '@patternfly/patternfly/assets/images/pfbg_576.jpg';
import pfbg576at2x from '@patternfly/patternfly/assets/images/pfbg_576@2x.jpg';
import pfbgBackgroundFilter from '@patternfly/patternfly/assets/images/background-filter.svg';

const bgImages = {
  [BackgroundImageSrc.lg]: pfbg1200,
  [BackgroundImageSrc.sm]: pfbg768,
  [BackgroundImageSrc.sm2x]: pfbg768at2x,
  [BackgroundImageSrc.xs]: pfbg576,
  [BackgroundImageSrc.xs2x]: pfbg576at2x,
  [BackgroundImageSrc.filter]: `${pfbgBackgroundFilter}#image_overlay`,
};

const BackgroundImage: React.FC = () => <PfBackgroundImage src={bgImages} />;
*/
const BackgroundImage: React.FC = () => <div />;
export default BackgroundImage;
