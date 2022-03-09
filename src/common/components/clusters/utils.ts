import capitalize from 'lodash/capitalize';

export const getHostStr = (isSNO: boolean, isTitle = false) => {
  const text = isSNO ? 'host' : 'hosts';
  return isTitle ? capitalize(text) : text;
};
