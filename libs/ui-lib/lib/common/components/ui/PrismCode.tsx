import React from 'react';
import Highlight, { defaultProps, Language, PrismTheme } from 'prism-react-renderer';
import { Content, ClipboardCopy, clipboardCopyFunc } from '@patternfly/react-core';
import { t_global_color_nonstatus_purple_300 } from '@patternfly/react-tokens/dist/js/t_global_color_nonstatus_purple_300';
import { t_global_color_nonstatus_blue_default as globalBlue } from '@patternfly/react-tokens/dist/js/t_global_color_nonstatus_blue_default';
import lightTheme from 'prism-react-renderer/themes/github';
import darkTheme from 'prism-react-renderer/themes/okaidia';
import './PrismCode.css';

export const getTheme = (styles?: PrismTheme['styles']) => {
  let prefersTheme = window.localStorage.getItem('bridge/theme');
  if (prefersTheme === 'systemDefault') {
    prefersTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  const theme = prefersTheme === 'dark' ? darkTheme : lightTheme;

  return {
    plain: {
      color: theme.plain.color,
      backgroundColor: theme.plain.backgroundColor,
      fontSize: '.93em',
    },
    styles: styles || [
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
};

type PrismCodeProps = {
  code: string;
  language?: Language;
  styles?: PrismTheme['styles'];
  copiable?: boolean;
};

const PrismCode: React.FC<PrismCodeProps> = ({
  code,
  styles,
  language = 'bash',
  copiable = false,
}) => (
  <Highlight {...defaultProps} code={code} language={language} theme={getTheme(styles)}>
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
