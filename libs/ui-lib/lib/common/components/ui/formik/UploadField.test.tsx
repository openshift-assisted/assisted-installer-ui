import * as React from 'react';
import { Formik, useFormikContext } from 'formik';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, describe, expect, test, vi } from 'vitest';
import UploadField from './UploadField';

type CapturedFileUploadProps = {
  filename?: string;
  onClearClick?: () => void;
  onDataChange?: (_event: unknown, data: string) => void;
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

const SSH_PUBLIC_KEY = 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI test@example.com';

const FormikValue = () => {
  const { values } = useFormikContext<{ sshPublicKey: string }>();
  return <output>{values.sshPublicKey}</output>;
};

const renderUploadField = (initialSshKey = '') => {
  const container = document.createElement('div');
  const root = createRoot(container);
  document.body.appendChild(container);

  void act(() => {
    root.render(
      <Formik initialValues={{ sshPublicKey: initialSshKey }} onSubmit={() => undefined}>
        <>
          <UploadField label="SSH public key" name="sshPublicKey" />
          <FormikValue />
        </>
      </Formik>,
    );
  });

  return {
    container,
    root,
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

/**
 * Unmounts the current Formik tree and mounts a fresh one in the same
 * container, simulating wizard step navigation (unmount → remount) that
 * triggers form reinitialization from the data source.
 */
const remountForm = (container: HTMLElement, root: Root, initialSshKey: string) => {
  void act(() => root.unmount());

  const newRoot = createRoot(container);
  void act(() => {
    newRoot.render(
      <Formik initialValues={{ sshPublicKey: initialSshKey }} onSubmit={() => undefined}>
        <>
          <UploadField label="SSH public key" name="sshPublicKey" />
          <FormikValue />
        </>
      </Formik>,
    );
  });

  return {
    root: newRoot,
    getProps: () => {
      expect(fileUploadMock.props).toBeDefined();
      return fileUploadMock.props as CapturedFileUploadProps;
    },
    getValue: () => container.querySelector('output')?.textContent,
    unmount: () => {
      void act(() => newRoot.unmount());
      container.remove();
    },
  };
};

afterEach(() => {
  fileUploadMock.props = undefined;
});

describe('UploadField', () => {
  test('stores file contents after upload', async () => {
    const uploadField = renderUploadField();
    const fileUploadProps = uploadField.getProps();

    await act(async () => {
      fileUploadProps.onDataChange?.(undefined, SSH_PUBLIC_KEY);
      await Promise.resolve();
    });

    expect(uploadField.getValue()).toBe(SSH_PUBLIC_KEY);
    uploadField.unmount();
  });

  test('clears value and filename on Clear', async () => {
    const uploadField = renderUploadField();
    const fileUploadProps = uploadField.getProps();

    // Upload a file first
    await act(async () => {
      fileUploadProps.onDataChange?.(undefined, SSH_PUBLIC_KEY);
      await Promise.resolve();
    });
    expect(uploadField.getValue()).toBe(SSH_PUBLIC_KEY);

    // Clear
    await act(async () => {
      fileUploadMock.props?.onClearClick?.();
      await Promise.resolve();
    });

    expect(uploadField.getValue()).toBe('');
    expect(fileUploadMock.props?.filename).toBe('');
    uploadField.unmount();
  });

  test('reinitializes with stale API value after remount — demonstrates the context-layer bug', async () => {
    // This test shows that UploadField itself is correct: it renders whatever
    // Formik's initialValues provide. The MGMT-24988 bug is in the wizard
    // context layer that feeds the stale API value back as initialValues
    // on remount (fixed in OptionalConfigurationsStep).

    const uploadField = renderUploadField();
    const fileUploadProps = uploadField.getProps();

    // Upload a key
    await act(async () => {
      fileUploadProps.onDataChange?.(undefined, SSH_PUBLIC_KEY);
      await Promise.resolve();
    });
    expect(uploadField.getValue()).toBe(SSH_PUBLIC_KEY);

    // Clear
    await act(async () => {
      fileUploadMock.props?.onClearClick?.();
      await Promise.resolve();
    });
    expect(uploadField.getValue()).toBe('');

    // Simulate navigate Next → Back: unmount and remount with the stale API
    // value as initialValues (this is what happens when the backend ignores
    // the empty-string update).
    const remounted = remountForm(uploadField.container, uploadField.root, SSH_PUBLIC_KEY);

    // The stale key reappears because the context fed it back as initialValues
    expect(remounted.getValue()).toBe(SSH_PUBLIC_KEY);
    // filename is empty because it is local component state, reset on mount
    expect(fileUploadMock.props?.filename).toBeUndefined();
    remounted.unmount();
  });

  test('shows empty after remount when context provides cleared value', async () => {
    // With the fix in OptionalConfigurationsStep, the context overrides
    // sshAuthorizedKey with the submitted (empty) value. Verify an empty
    // initialValue keeps the form empty after remount.

    const uploadField = renderUploadField(SSH_PUBLIC_KEY);
    expect(uploadField.getValue()).toBe(SSH_PUBLIC_KEY);

    // Clear
    await act(async () => {
      fileUploadMock.props?.onClearClick?.();
      await Promise.resolve();
    });
    expect(uploadField.getValue()).toBe('');

    // Remount with corrected context (empty string, as the fix provides)
    const remounted = remountForm(uploadField.container, uploadField.root, '');
    expect(remounted.getValue()).toBe('');
    remounted.unmount();
  });

  test('stores manually entered text', async () => {
    const uploadField = renderUploadField();
    const fileUploadProps = uploadField.getProps();

    await act(async () => {
      fileUploadProps.onTextChange?.(undefined, 'manually entered key');
      await Promise.resolve();
    });

    expect(uploadField.getValue()).toBe('manually entered key');
    uploadField.unmount();
  });

  test('does not break when Clear is clicked without prior upload', async () => {
    const uploadField = renderUploadField();

    await act(async () => {
      fileUploadMock.props?.onClearClick?.();
      await Promise.resolve();
    });

    expect(uploadField.getValue()).toBe('');
    expect(fileUploadMock.props?.filename).toBe('');
    uploadField.unmount();
  });
});
