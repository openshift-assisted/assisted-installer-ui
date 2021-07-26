import React from 'react';
import Highlight, { defaultProps, Language, PrismTheme } from 'prism-react-renderer';
import { Text, TextVariants, ClipboardCopy, clipboardCopyFunc } from '@patternfly/react-core';
import defaultTheme from 'prism-react-renderer/themes/github';
import './PrismCode.css';
type PrismCodeProps = {
  code: string;
  language?: Language;
  theme?: PrismTheme;
  copiable?: boolean;
};
const PrismCode: React.FC<PrismCodeProps> = ({
  code,
  language = 'bash',
  theme = defaultTheme,
  copiable = false,
}) => (
  <Highlight {...defaultProps} code={code} language={language} theme={theme}>
    {({ className, style, tokens, getLineProps, getTokenProps }) => (
      <Text component={TextVariants.pre} className={className} style={style}>
        {copiable && (
          <ClipboardCopy
            isReadOnly
            variant={'inline-compact'}
            onCopy={(e) => clipboardCopyFunc(e, code)}
            style={{ float: 'right', background: 'inherit' }}
          >
            {}
          </ClipboardCopy>
        )}
        {tokens.map((line, i) => (
          <div key={i} {...getLineProps({ line, key: i })}>
            {line.map((token, key) => (
              <span key={key} {...getTokenProps({ token, key })} />
            ))}
          </div>
        ))}
      </Text>
    )}
  </Highlight>
);

export default PrismCode;
