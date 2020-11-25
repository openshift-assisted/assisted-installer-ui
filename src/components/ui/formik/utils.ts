export const getFieldId = (fieldName: string, fieldType: string, unique?: string) => {
  unique = unique ? `${unique}-` : '';
  return `form-${fieldType}-${fieldName.replace(/\./g, '-')}-${unique}field`;
};

export const trimSshPublicKey = (key: string) =>
  key
    .split('\n')
    .map((row) => row.trim())
    .filter(Boolean)
    .join('\n');

export const trimCommaSeparatedList = (list: string) =>
  list
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .join(',');
