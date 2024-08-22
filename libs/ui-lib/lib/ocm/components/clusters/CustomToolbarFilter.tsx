import {
  Chip,
  ChipGroup,
  PickOptional,
  ToolbarChip,
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
    chips: [] as (string | ToolbarChip)[],
    showToolbarItem: true,
  };

  constructor(props: ToolbarFilterProps) {
    super(props);
    this.state = {
      isMounted: false,
    };
  }

  componentDidMount() {
    const { categoryName, chips } = this.props;
    this.context.updateNumberFilters(
      typeof categoryName !== 'string' && categoryName.hasOwnProperty('key')
        ? categoryName.key
        : categoryName.toString(),
      chips ? chips.length : 0,
    );
    this.setState({ isMounted: true });
  }

  componentDidUpdate() {
    const { categoryName, chips } = this.props;
    this.context.updateNumberFilters(
      typeof categoryName !== 'string' && categoryName.hasOwnProperty('key')
        ? categoryName.key
        : categoryName.toString(),
      chips ? chips.length : 0,
    );
  }

  render() {
    const {
      children,
      chips,
      deleteChipGroup,
      deleteChip,
      chipGroupExpandedText,
      chipGroupCollapsedText,
      categoryName,
      showToolbarItem,
      isExpanded,
      expandableChipContainerRef,
      ...props
    } = this.props;
    const { isExpanded: managedIsExpanded, chipGroupContentRef } = this.context;
    const _isExpanded = isExpanded !== undefined ? isExpanded : managedIsExpanded;
    const categoryKey =
      typeof categoryName !== 'string' && categoryName.hasOwnProperty('key')
        ? categoryName.key
        : categoryName.toString();

    const chipGroup =
      chips !== undefined && chips.length ? (
        <ToolbarItem variant="chip-group">
          <ChipGroup
            key={categoryKey}
            categoryName={typeof categoryName === 'string' ? categoryName : categoryName.name}
            isClosable={deleteChipGroup !== undefined}
            onClick={() => deleteChipGroup && deleteChipGroup(categoryName)}
            collapsedText={chipGroupCollapsedText}
            expandedText={chipGroupExpandedText}
          >
            {chips.map((chip) =>
              typeof chip === 'string' ? (
                <Chip key={chip} onClick={() => deleteChip && deleteChip(categoryKey, chip)}>
                  {chip}
                </Chip>
              ) : (
                <Chip key={chip.key} onClick={() => deleteChip && deleteChip(categoryKey, chip)}>
                  {chip.node}
                </Chip>
              ),
            )}
          </ChipGroup>
        </ToolbarItem>
      ) : null;

    if (!_isExpanded && this.state.isMounted) {
      return (
        <React.Fragment>
          {showToolbarItem && <ToolbarItem {...props}>{children}</ToolbarItem>}
          {chipGroupContentRef &&
            chipGroupContentRef.current !== null &&
            chipGroupContentRef.current.firstElementChild !== null &&
            ReactDOM.createPortal(chipGroup, chipGroupContentRef.current.firstElementChild)}
        </React.Fragment>
      );
    }

    return (
      <ToolbarContentContext.Consumer>
        {({ chipContainerRef }) => (
          <React.Fragment>
            {showToolbarItem && <ToolbarItem {...props}>{children}</ToolbarItem>}
            {chipContainerRef.current &&
              ReactDOM.createPortal(chipGroup, chipContainerRef.current as Element)}
            {expandableChipContainerRef &&
              expandableChipContainerRef.current &&
              ReactDOM.createPortal(chipGroup, expandableChipContainerRef.current)}
          </React.Fragment>
        )}
      </ToolbarContentContext.Consumer>
    );
  }
}

export { CustomToolbarFilter };
