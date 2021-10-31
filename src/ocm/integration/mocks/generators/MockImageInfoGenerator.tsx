import { ImageInfo } from '../../../../common';

const MockImageInfoGenerator = {
  generate(overrides: Partial<ImageInfo>): ImageInfo {
    return {
      ...overrides,
    };
  },
};

export default MockImageInfoGenerator;
