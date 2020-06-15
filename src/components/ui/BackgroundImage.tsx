import React from 'react';
import {
  BackgroundImage as PfBackgroundImage,
  BackgroundImageSrcMap,
} from '@patternfly/react-core';

import pfbg1200 from '@patternfly/patternfly/assets/images/pfbg_1200.jpg';
import pfbg768 from '@patternfly/patternfly/assets/images/pfbg_768.jpg';
import pfbg768at2x from '@patternfly/patternfly/assets/images/pfbg_768@2x.jpg';
import pfbg576 from '@patternfly/patternfly/assets/images/pfbg_576.jpg';
import pfbg576at2x from '@patternfly/patternfly/assets/images/pfbg_576@2x.jpg';

const bgImages: BackgroundImageSrcMap = {
  xs: pfbg576,
  xs2x: pfbg576at2x,
  sm: pfbg768,
  sm2x: pfbg768at2x,
  lg: pfbg1200,
};

const BackgroundImage: React.FC = () => <PfBackgroundImage src={bgImages} />;

export default BackgroundImage;
