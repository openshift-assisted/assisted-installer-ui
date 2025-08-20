import React from 'react';
import {
  Select,
  SelectOption,
  SelectList,
  SelectOptionProps,
  MenuToggle,
  MenuToggleElement,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  Button,
  FormGroup,
  Bullseye,
  Spinner,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Divider,
} from '@patternfly/react-core';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';
import { useField } from 'formik';
import { isEqual } from 'lodash-es';
import { FieldProps } from './types';

const NO_RESULTS = 'no_results';

const createItemId = (val: string) => `select-multi-typeahead-${val.replace(' ', '-')}`;

const SelectFieldWithSearch = ({
  name,
  label,
  isRequired,
  selectOptions,
  filterValue,
  setFilterValue,
  isMultiSelect = false,
  isLoading = false,
  placeholder,
  helperText,
}: {
  selectOptions: (SelectOptionProps & { showDivider?: boolean })[];
  filterValue: string;
  setFilterValue: (value: string) => void;
  isMultiSelect?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  helperText?: React.ReactNode;
} & FieldProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [{ value }, , { setValue }] = useField<unknown | unknown[]>(name);

  const [focusedItemIndex, setFocusedItemIndex] = React.useState<number | null>(null);
  const [activeItemId, setActiveItemId] = React.useState<string | null>(null);
  const textInputRef = React.useRef<HTMLInputElement>();

  const setActiveAndFocusedItem = (itemIndex: number) => {
    setFocusedItemIndex(itemIndex);
    const focusedItem = selectOptions[itemIndex];
    setActiveItemId(createItemId(focusedItem.value as string));
  };

  const resetActiveAndFocusedItem = () => {
    setFocusedItemIndex(null);
    setActiveItemId(null);
  };

  const closeMenu = () => {
    setIsOpen(false);
    resetActiveAndFocusedItem();
  };

  const onInputClick = () => {
    if (!isOpen) {
      setIsOpen(true);
    } else if (!filterValue) {
      closeMenu();
    }
  };

  const handleMenuArrowKeys = (key: string) => {
    let indexToFocus = 0;

    if (!isOpen) {
      setIsOpen(true);
    }

    if (selectOptions.every((option) => option.isDisabled)) {
      return;
    }

    if (key === 'ArrowUp') {
      // When no index is set or at the first index, focus to the last, otherwise decrement focus index
      if (focusedItemIndex === null || focusedItemIndex === 0) {
        indexToFocus = selectOptions.length - 1;
      } else {
        indexToFocus = focusedItemIndex - 1;
      }

      // Skip disabled options
      while (selectOptions[indexToFocus].isDisabled) {
        indexToFocus--;
        if (indexToFocus === -1) {
          indexToFocus = selectOptions.length - 1;
        }
      }
    }

    if (key === 'ArrowDown') {
      // When no index is set or at the last index, focus to the first, otherwise increment focus index
      if (focusedItemIndex === null || focusedItemIndex === selectOptions.length - 1) {
        indexToFocus = 0;
      } else {
        indexToFocus = focusedItemIndex + 1;
      }

      // Skip disabled options
      while (selectOptions[indexToFocus].isDisabled) {
        indexToFocus++;
        if (indexToFocus === selectOptions.length) {
          indexToFocus = 0;
        }
      }
    }

    setActiveAndFocusedItem(indexToFocus);
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const focusedItem = focusedItemIndex !== null ? selectOptions[focusedItemIndex] : null;

    switch (event.key) {
      case 'Enter':
        if (
          isOpen &&
          focusedItem &&
          focusedItem.value !== NO_RESULTS &&
          !focusedItem.isAriaDisabled
        ) {
          onSelect(focusedItem.value as string);
        }

        if (!isOpen) {
          setIsOpen(true);
        }

        break;
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        handleMenuArrowKeys(event.key);
        break;
    }
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
    textInputRef?.current?.focus();
  };

  const onTextInputChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setFilterValue(value);
    resetActiveAndFocusedItem();
  };

  const onSelect = React.useCallback(
    (val) => {
      if (val && val !== NO_RESULTS) {
        if (isMultiSelect && Array.isArray(value)) {
          setValue(
            value.some((v) => isEqual(v, val))
              ? value.filter((v) => !isEqual(v, val))
              : [...(value as unknown[]), val],
          );
        } else {
          setValue(val);
          setFilterValue(selectOptions.find((option) => option.value === val)?.children as string);
        }
      }

      textInputRef.current?.focus();
    },
    [isMultiSelect, setValue, setFilterValue, selectOptions, value],
  );

  const onClearButtonClick = () => {
    setFilterValue('');
    resetActiveAndFocusedItem();
    textInputRef?.current?.focus();
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      variant="typeahead"
      aria-label="Multi typeahead checkbox menu toggle"
      onClick={onToggleClick}
      innerRef={toggleRef}
      isExpanded={isOpen}
      isFullWidth
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          isExpanded={isOpen}
          value={filterValue}
          placeholder={placeholder}
          onClick={onInputClick}
          onChange={onTextInputChange}
          onKeyDown={onInputKeyDown}
          innerRef={textInputRef}
          autoComplete="off"
          role="combobox"
          id="typeahead-select-input"
          aria-controls="typeahead-select-listbox"
          {...(activeItemId && { 'aria-activedescendant': activeItemId })}
        />
        <TextInputGroupUtilities {...(!filterValue ? { style: { display: 'none' } } : {})}>
          <Button variant="plain" onClick={onClearButtonClick} aria-label="Clear input value">
            <TimesIcon aria-hidden />
          </Button>
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <FormGroup label={label} isRequired={isRequired}>
      <Select
        role="menu"
        id="typeahead-select"
        isOpen={isOpen}
        selected={value}
        onSelect={(_event, selection) => onSelect(selection as string)}
        onOpenChange={(isOpen) => {
          !isOpen && closeMenu();
        }}
        toggle={toggle}
        isScrollable
      >
        <SelectList isAriaMultiselectable id="select-typeahead-listbox">
          {isLoading ? (
            <SelectOption key={'loader'}>
              <Bullseye>
                <Spinner size="lg" />
              </Bullseye>
            </SelectOption>
          ) : (
            selectOptions.map((option, index) => (
              <>
                {option.showDivider && <Divider component="li" key={`divider-${index}`} />}
                <SelectOption
                  hasCheckbox={isMultiSelect && !option.isAriaDisabled}
                  isSelected={
                    isMultiSelect && Array.isArray(value)
                      ? value.some((v) => isEqual(v, option.value))
                      : value === option.value
                  }
                  key={`option-${index}`}
                  isFocused={focusedItemIndex === index}
                  ref={null}
                  {...option}
                />
              </>
            ))
          )}
        </SelectList>
      </Select>
      {helperText && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem>{helperText}</HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
  );
};

export default SelectFieldWithSearch;
