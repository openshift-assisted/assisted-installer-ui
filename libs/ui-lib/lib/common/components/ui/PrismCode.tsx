import React from 'react';
import Highlight, { defaultProps, Language, PrismTheme } from 'prism-react-renderer';
import { Content, ClipboardCopy, clipboardCopyFunc } from '@patternfly/react-core';
import { t_global_color_nonstatus_purple_300 } from '@patternfly/react-tokens/dist/js/t_global_color_nonstatus_purple_300';
import { t_global_color_nonstatus_blue_default as globalBlue } from '@patternfly/react-tokens/dist/js/t_global_color_nonstatus_blue_default';
import defaultTheme from 'prism-react-renderer/themes/github';
import './PrismCode.css';
export const SimpleAIPrismTheme = {
  plain: {
    color: '#333333',
    backgroundColor: defaultTheme.plain.backgroundColor,
    fontSize: '.93em',
  },
  styles: [
    {
      types: ['variable'],
      style: {
        color: globalBlue.value,
      },
    },
    {
      types: ['class-name', 'function', 'tag', 'attr-name'],
      style: {
        color: t_global_color_nonstatus_purple_300.value,
      },
    },
  ],
};
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
      <Content component="pre" className={className} style={style}>
        {copiable && (
          <ClipboardCopy
            isReadOnly
            variant={'inline-compact'}
            onCopy={(e) => clipboardCopyFunc(e, code)}
            style={{ float: 'right', background: 'inherit' }}
          >
            {''}
          </ClipboardCopy>
        )}
        {tokens.map((line, i) => (
          <div key={i} {...getLineProps({ line, key: i })}>
            {line.map((token, key) => (
              <span key={key} {...getTokenProps({ token, key })} />
            ))}
          </div>
        ))}
      </Content>
    )}
  </Highlight>
);

export default PrismCode;
