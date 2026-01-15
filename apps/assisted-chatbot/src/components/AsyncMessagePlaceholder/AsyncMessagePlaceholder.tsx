import { Skeleton } from '@patternfly/react-core';
import './AsyncMessagePlaceholder.css';

export const AsyncMessagePlaceholder = () => (
  <div className="pf-v6-u-display-flex pf-v6-u-align-items-flex-start pf-v6-u-p-md">
    <div className="pf-v6-u-mr-md">
      <Skeleton
        shape="circle"
        width="2.5rem"
        height="2.5rem"
        className="ai-async-message-skeleton--slow"
        screenreaderText="Loading user avatar"
      />
    </div>
    <div className="pf-v6-u-flex-1">
      <div className="pf-v6-u-mb-xs">
        <Skeleton
          width="6rem"
          height="0.875rem"
          className="ai-async-message-skeleton--slow"
          screenreaderText="Loading message timestamp"
        />
      </div>
      <div className="pf-v6-u-mb-xs">
        <Skeleton width="85%" height="1rem" screenreaderText="Loading message content" />
      </div>
      <div className="pf-v6-u-mb-xs">
        <Skeleton width="70%" height="1rem" screenreaderText="Loading message content" />
      </div>
      <div>
        <Skeleton width="55%" height="1rem" screenreaderText="Loading message content" />
      </div>
    </div>
  </div>
);
