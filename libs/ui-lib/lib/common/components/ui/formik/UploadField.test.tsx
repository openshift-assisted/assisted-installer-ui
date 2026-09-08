import * as React from 'react';
import { Formik, useFormikContext } from 'formik';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, test, vi } from 'vitest';
import UploadField from './UploadField';

type CapturedFileUploadProps = {
  filename?: string;
  onClearClick?: () => void;
  onDataChange?: (_event: unknown, data: string) => void;
  onReadFinished?: (_event: unknown, file: File) => void;
  onReadStarted?: (_event: unknown, file: File) => void;
  onTextChange?: (_event: unknown, text: string) => void;
  value?: string | File;
};

type Act = (callback: () => void | Promise<void>) => Promise<void>;

const act = (React as unknown as { unstable_act: Act }).unstable_act;

const fileUploadMock = vi.hoisted(() => ({
  props: undefined as CapturedFileUploadProps | undefined,
}));

vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);

vi.mock('@patternfly/react-core', () => ({
  FileUpload: (props: CapturedFileUploadProps) => {
    fileUploadMock.props = props;
    return null;
  },
  FormGroup: ({ children }: { children?: React.ReactNode }) => children,
  FormHelperText: ({ children }: { children?: React.ReactNode }) => children,
  HelperText: ({ children }: { children?: React.ReactNode }) => children,
  HelperTextItem: ({ children }: { children?: React.ReactNode }) => children,
}));

vi.mock('../../../hooks/use-translation-wrapper', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const SSH_PUBLIC_KEY = 'ssh-ed25519 test@example.com';

const createFile = (name: string) => new File([SSH_PUBLIC_KEY], name);

const FormikValue = () => {
  const { values } = useFormikContext<{ sshPublicKey: string }>();

  return <output>{values.sshPublicKey}</output>;
};

const renderUploadField = () => {
  const container = document.createElement('div');
  const root = createRoot(container);
  document.body.appendChild(container);

  void act(() => {
    root.render(
      <Formik initialValues={{ sshPublicKey: '' }} onSubmit={() => undefined}>
        <>
          <UploadField label="SSH public key" name="sshPublicKey" />
          <FormikValue />
        </>
      </Formik>,
    );
  });

  return {
    getProps: () => {
      expect(fileUploadMock.props).toBeDefined();
      return fileUploadMock.props as CapturedFileUploadProps;
    },
    getValue: () => container.querySelector('output')?.textContent,
    unmount: () => {
      void act(() => root.unmount());
      container.remove();
    },
  };
};

afterEach(() => {
  fileUploadMock.props = undefined;
});

describe('UploadField', () => {
  test('does not restore file contents when a pending read finishes after Clear', async () => {
    const uploadField = renderUploadField();
    const fileUploadProps = uploadField.getProps();
    const file = createFile('stale.pub');

    await act(async () => {
      fileUploadProps.onReadStarted?.(undefined, file);
      fileUploadProps.onClearClick?.();
      fileUploadProps.onReadFinished?.(undefined, file);
      fileUploadProps.onDataChange?.(undefined, SSH_PUBLIC_KEY);
      await Promise.resolve();
    });

    expect(uploadField.getValue()).toBe('');
    expect(fileUploadMock.props?.filename).toBe('');
    uploadField.unmount();
  });

  test('stores completed file reads and entered text', async () => {
    const uploadField = renderUploadField();
    const fileUploadProps = uploadField.getProps();
    const file = createFile('key.pub');

    await act(async () => {
      fileUploadProps.onReadStarted?.(undefined, file);
      fileUploadProps.onReadFinished?.(undefined, file);
      fileUploadProps.onDataChange?.(undefined, SSH_PUBLIC_KEY);
      await Promise.resolve();
    });
    expect(uploadField.getValue()).toBe(SSH_PUBLIC_KEY);

    await act(async () => {
      fileUploadMock.props?.onTextChange?.(undefined, 'manually entered key');
      await Promise.resolve();
    });
    expect(uploadField.getValue()).toBe('manually entered key');
    uploadField.unmount();
  });

  test('only stores the contents of the most recently started file read', async () => {
    const uploadField = renderUploadField();
    const fileUploadProps = uploadField.getProps();
    const firstFile = createFile('first.pub');
    const secondFile = createFile('second.pub');

    await act(async () => {
      fileUploadProps.onReadStarted?.(undefined, firstFile);
      fileUploadProps.onReadStarted?.(undefined, secondFile);

      fileUploadProps.onReadFinished?.(undefined, firstFile);
      fileUploadProps.onDataChange?.(undefined, 'first key');

      fileUploadProps.onReadFinished?.(undefined, secondFile);
      fileUploadProps.onDataChange?.(undefined, 'second key');
      await Promise.resolve();
    });

    expect(uploadField.getValue()).toBe('second key');
    uploadField.unmount();
  });

  test('does not restore a cleared read when a new file read starts', async () => {
    const uploadField = renderUploadField();
    const fileUploadProps = uploadField.getProps();
    const staleFile = createFile('stale.pub');
    const currentFile = createFile('current.pub');

    await act(async () => {
      fileUploadProps.onReadStarted?.(undefined, staleFile);
      fileUploadProps.onClearClick?.();
      fileUploadProps.onReadStarted?.(undefined, currentFile);

      fileUploadProps.onReadFinished?.(undefined, staleFile);
      fileUploadProps.onDataChange?.(undefined, 'stale key');

      fileUploadProps.onReadFinished?.(undefined, currentFile);
      fileUploadProps.onDataChange?.(undefined, 'current key');
      await Promise.resolve();
    });

    expect(uploadField.getValue()).toBe('current key');
    uploadField.unmount();
  });
});
