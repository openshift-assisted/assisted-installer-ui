// This component resolves the folowing bug: https://issues.redhat.com/browse/MGMT-18567
// Once this issues is addressed in PatternFly, this component should be removed.

import {
  Label,
  LabelGroup,
  PickOptional,
  ToolbarLabel,
  ToolbarContentContext,
  ToolbarContext,
  ToolbarFilterProps,
  ToolbarItem,
} from '@patternfly/react-core';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

interface ToolbarFilterState {
  isMounted: boolean;
}

class CustomToolbarFilter extends React.Component<ToolbarFilterProps, ToolbarFilterState> {
  static displayName = 'CustomToolbarFilter';
  static contextType = ToolbarContext;
  context!: React.ContextType<typeof ToolbarContext>;
  static defaultProps: PickOptional<ToolbarFilterProps> = {
    labels: [] as (string | ToolbarLabel)[],
    showToolbarItem: true,
  };

  constructor(props: ToolbarFilterProps) {
    super(props);
    this.state = {
      isMounted: false,
    };
  }

  componentDidMount() {
    const { categoryName, labels } = this.props;
    this.context.updateNumberFilters(
      typeof categoryName !== 'string' && categoryName.hasOwnProperty('key')
        ? categoryName.key
        : categoryName.toString(),
      labels ? labels.length : 0,
    );
    this.setState({ isMounted: true });
  }

  componentDidUpdate() {
    const { categoryName, labels } = this.props;
    this.context.updateNumberFilters(
      typeof categoryName !== 'string' && categoryName.hasOwnProperty('key')
        ? categoryName.key
        : categoryName.toString(),
      labels ? labels.length : 0,
    );
  }

  render() {
    const {
      children,
      labels,
      deleteLabelGroup,
      deleteLabel,
      labelGroupExpandedText,
      labelGroupCollapsedText,
      categoryName,
      showToolbarItem,
      isExpanded,
      expandableLabelContainerRef,
      ...props
    } = this.props;
    const { isExpanded: managedIsExpanded, labelGroupContentRef } = this.context;
    const _isExpanded = isExpanded !== undefined ? isExpanded : managedIsExpanded;
    const categoryKey =
      typeof categoryName !== 'string' && categoryName.hasOwnProperty('key')
        ? categoryName.key
        : categoryName.toString();

    const labelGroup =
      labels !== undefined && labels.length ? (
        <ToolbarItem variant="label-group">
          <LabelGroup
            key={categoryKey}
            categoryName={typeof categoryName === 'string' ? categoryName : categoryName.name}
            isClosable={deleteLabelGroup !== undefined}
            onClick={() => deleteLabelGroup && deleteLabelGroup(categoryName)}
            collapsedText={labelGroupCollapsedText}
            expandedText={labelGroupExpandedText}
          >
            {labels.map((label) =>
              typeof label === 'string' ? (
                <Label
                  variant="outline"
                  key={label}
                  onClose={() => deleteLabel && deleteLabel(categoryKey, label)}
                >
                  {label}
                </Label>
              ) : (
                <Label
                  variant="outline"
                  key={label.key}
                  onClose={() => deleteLabel && deleteLabel(categoryKey, label)}
                >
                  {label.node}
                </Label>
              ),
            )}
          </LabelGroup>
        </ToolbarItem>
      ) : null;

    if (!_isExpanded && this.state.isMounted) {
      return (
        <React.Fragment>
          {showToolbarItem && <ToolbarItem {...props}>{children}</ToolbarItem>}
          {labelGroupContentRef &&
            labelGroupContentRef.current !== null &&
            labelGroupContentRef.current.firstElementChild !== null &&
            ReactDOM.createPortal(labelGroup, labelGroupContentRef.current.firstElementChild)}
        </React.Fragment>
      );
    }

    return (
      <ToolbarContentContext.Consumer>
        {({ labelContainerRef }) => (
          <React.Fragment>
            {showToolbarItem && <ToolbarItem {...props}>{children}</ToolbarItem>}
            {labelContainerRef.current &&
              ReactDOM.createPortal(labelGroup, labelContainerRef.current as Element)}
            {expandableLabelContainerRef &&
              expandableLabelContainerRef.current &&
              ReactDOM.createPortal(labelGroup, expandableLabelContainerRef.current)}
          </React.Fragment>
        )}
      </ToolbarContentContext.Consumer>
    );
  }
}

export { CustomToolbarFilter };
