import React, { PropsWithChildren } from 'react';

interface RenderIfProps {
  condition: boolean;
}

export const RenderIf = ({ condition = false, children }: PropsWithChildren<RenderIfProps>) =>
  condition ? <>{children}</> : null;
