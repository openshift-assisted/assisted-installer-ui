export const getFieldId = (fieldName: string, fieldType: string, unique?: string) => {
  unique = unique ? `${unique}-` : '';
  return `form-${fieldType}-${fieldName.replace(/\./g, '-')}-${unique}field`;
};
