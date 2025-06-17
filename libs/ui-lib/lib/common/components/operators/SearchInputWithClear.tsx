import React from 'react';
import { TextInput, Button } from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons/dist/js/icons/times-icon';

const SearchInputWithClear = ({
  searchTerm,
  setSearchTerm,
}: {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}) => {
  return (
    <div style={{ position: 'relative', minWidth: '200px', maxWidth: '400px', width: '100%' }}>
      <TextInput
        value={searchTerm}
        type="text"
        onChange={(_event, value) => setSearchTerm(value)}
        placeholder="Search"
        aria-label="Search input"
        style={{ paddingRight: '2.5rem' }} // espacio para la X
      />
      {searchTerm && (
        <Button
          variant="plain"
          aria-label="Clear input"
          onClick={() => setSearchTerm('')}
          style={{
            position: 'absolute',
            right: '0.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            padding: 0,
            height: '100%',
          }}
        >
          <TimesIcon />
        </Button>
      )}
    </div>
  );
};

export default SearchInputWithClear;
