import React, { Dispatch, SetStateAction } from 'react';
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
  Divider,
  FormHelperText,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';
import { OpenshiftVersionOptionType } from '../../types';
import { HelperTextType } from './OpenShiftVersionDropdown';
import { useTranslation } from '../../hooks/use-translation-wrapper';

type OpenshiftSelectWithSearchProps = {
  versions: OpenshiftVersionOptionType[];
  getHelperText?: HelperTextType;
  setCustomOpenshiftSelect: Dispatch<SetStateAction<OpenshiftVersionOptionType | undefined>>;
};

export const OpenShiftSelectWithSearch: React.FunctionComponent<OpenshiftSelectWithSearchProps> = ({
  versions,
  getHelperText,
  setCustomOpenshiftSelect,
}: OpenshiftSelectWithSearchProps) => {
  const initialSelectOptions = React.useMemo(
    () =>
      versions.map((version) => ({
        children:
          version.supportLevel === 'beta'
            ? version.label + ' - ' + 'Developer preview release'
            : version.label,
        value: version.value,
      })),
    [versions],
  );

  const [isOpen, setIsOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string>('');
  const [inputValue, setInputValue] = React.useState<string>('');
  const [filterValue, setFilterValue] = React.useState<string>('');
  const [selectOptions, setSelectOptions] =
    React.useState<SelectOptionProps[]>(initialSelectOptions);
  const [focusedItemIndex, setFocusedItemIndex] = React.useState<number | null>(null);
  const [activeItem, setActiveItem] = React.useState<string | null>(null);
  const textInputRef = React.useRef<HTMLInputElement>();
  const { t } = useTranslation();

  React.useEffect(() => {
    if (textInputRef.current) {
      textInputRef.current.maxLength = 30;
    }
  }, []);

  React.useEffect(() => {
    let newSelectOptions: SelectOptionProps[] = initialSelectOptions;

    // Filter menu items based on the text input value when one exists
    if (filterValue) {
      newSelectOptions = initialSelectOptions.filter((menuItem) =>
        String(menuItem.children).toLowerCase().includes(filterValue.toLowerCase()),
      );

      // When no options are found after filtering, display 'No results found'
      if (!newSelectOptions.length) {
        newSelectOptions = [
          {
            isDisabled: true,
            children: `No results found for "${filterValue}"`,
            value: 'no results',
          },
        ];
      }

      // Open the menu when the input value changes and the new value is not empty
      if (!isOpen) {
        setIsOpen(true);
      }
    }

    setSelectOptions(newSelectOptions);
    setActiveItem(null);
    setFocusedItemIndex(null);
  }, [filterValue, initialSelectOptions, isOpen]);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    // Check if the specific value exists in newSelectOptions
    const foundItem = selectOptions.find((menuItem) => String(menuItem.value) === String(value));
    const newLabel = foundItem?.children;
    if (value && value !== 'no results') {
      setInputValue(newLabel as string);
      setFilterValue('');
      setSelected(value as string);
      const filteredVersions = versions.filter((version) => version.value === value);
      setCustomOpenshiftSelect({
        label:
          filteredVersions[0].supportLevel === 'beta'
            ? filteredVersions[0].label + ' - ' + t('ai:Developer preview release')
            : filteredVersions[0].label,
        value: filteredVersions[0].value,
        version: filteredVersions[0].version,
        default: filteredVersions[0].default,
        supportLevel: filteredVersions[0].supportLevel,
      });
    }
    setIsOpen(false);
    setFocusedItemIndex(null);
    setActiveItem(null);
  };

  const onTextInputChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setInputValue(value);
    setFilterValue(value);
  };

  const handleMenuArrowKeys = (key: string) => {
    let indexToFocus;

    if (isOpen) {
      if (key === 'ArrowUp') {
        // When no index is set or at the first index, focus to the last, otherwise decrement focus index
        if (focusedItemIndex === null || focusedItemIndex === 0) {
          indexToFocus = selectOptions.length - 1;
        } else {
          indexToFocus = focusedItemIndex - 1;
        }
      }

      if (key === 'ArrowDown') {
        // When no index is set or at the last index, focus to the first, otherwise increment focus index
        if (focusedItemIndex === null || focusedItemIndex === selectOptions.length - 1) {
          indexToFocus = 0;
        } else {
          indexToFocus = focusedItemIndex + 1;
        }
      }

      setFocusedItemIndex(indexToFocus ?? 0);
      const focusedItem = selectOptions.filter((option) => !option.isDisabled)[indexToFocus ?? 0];
      setActiveItem(`select-typeahead-${(focusedItem.value as string).replace(' ', '-')}`);
    }
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const enabledMenuItems = selectOptions.filter((option) => !option.isDisabled);
    const [firstMenuItem] = enabledMenuItems;
    const focusedItem = focusedItemIndex ? enabledMenuItems[focusedItemIndex] : firstMenuItem;

    switch (event.key) {
      // Select the first available option
      case 'Enter':
        if (isOpen && focusedItem.value !== 'no results') {
          setInputValue(String(focusedItem.children));
          setFilterValue('');
          setSelected(String(focusedItem.children));
        }

        setIsOpen((prevIsOpen) => !prevIsOpen);
        setFocusedItemIndex(null);
        setActiveItem(null);

        break;
      case 'Tab':
      case 'Escape':
        setIsOpen(false);
        setActiveItem(null);
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        handleMenuArrowKeys(event.key);
        break;
    }
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      variant="typeahead"
      onClick={onToggleClick}
      isExpanded={isOpen}
      isFullWidth
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={inputValue}
          onClick={onToggleClick}
          onChange={onTextInputChange}
          onKeyDown={onInputKeyDown}
          id="typeahead-select-input"
          autoComplete="off"
          innerRef={textInputRef}
          placeholder=""
          {...(activeItem && { 'aria-activedescendant': activeItem })}
          role="combobox"
          isExpanded={isOpen}
          aria-controls="select-typeahead-listbox"
        />

        <TextInputGroupUtilities>
          {!!inputValue && (
            <Button icon={<TimesIcon aria-hidden />}
              variant="plain"
              onClick={() => {
                setSelected('');
                setInputValue('');
                setFilterValue('');
                textInputRef?.current?.focus();
              }}
              aria-label="Clear input value"
             />
          )}
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

  const helperText = getHelperText && getHelperText(selected, true);

  return (
    <>
      <Select
        id="customOpenshiftSelect"
        isOpen={isOpen}
        selected={selected}
        onSelect={onSelect}
        onOpenChange={() => {
          setIsOpen(false);
        }}
        toggle={toggle}
        isScrollable
      >
        <SelectList id="select-typeahead-listbox">
          {selectOptions.reverse().map((option, index) => {
            const match = (option.value as string).match(/\d+\.(\d+)\.\d+/);
            const y = match ? match[1] : null;

            const previousY =
              index > 0
                ? ((selectOptions[index - 1].value as string).match(/\d+\.(\d+)\.\d+/) || [])[1]
                : null;

            const showDivider = previousY !== null && y !== previousY;
            return (
              <React.Fragment key={index}>
                {showDivider && (
                  <Divider
                    component="li"
                    id={`divider-${option.value as string}`}
                    key={`divider-${option.value as string}`}
                  />
                )}
                <SelectOption
                  key={option.value as string}
                  isFocused={focusedItemIndex === index}
                  className={option.className}
                  onClick={() => setSelected(option.value as string)}
                  id={`select-typeahead-${(option.value as string).replace(' ', '-')}`}
                  {...option}
                  ref={null}
                />
              </React.Fragment>
            );
          })}
        </SelectList>
      </Select>
      <FormHelperText>
        <HelperText>
          <HelperTextItem variant="default">
            {helperText ??
              'Select an OpenShift version from the list or use the type ahead to narrow down the list.'}
          </HelperTextItem>
        </HelperText>
      </FormHelperText>
    </>
  );
};
