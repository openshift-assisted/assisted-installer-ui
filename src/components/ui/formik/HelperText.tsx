import React from 'react';
import { css } from '@patternfly/react-styles';

type HelperTextProps = {
  fieldId: string;
};

/**
 * HelperText component standardizes the format of non string helperText prop on FormGroup
 * which is otherwise rendered 'as is' in FormGroup
 */
const HelperText: React.FC<HelperTextProps> = ({ fieldId, children }) => (
  <div className={css('pf-c-form__helper-text')} id={`${fieldId}-helper`} aria-live="polite">
    {children}
  </div>
);

export default HelperText;
