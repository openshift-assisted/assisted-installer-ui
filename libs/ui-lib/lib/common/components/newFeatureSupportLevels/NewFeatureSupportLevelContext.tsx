import React from 'react';
import { NewFeatureSupportLevelData } from './types';

const NewFeatureSupportLevelContext = React.createContext<NewFeatureSupportLevelData | null>(null);

export const NewFeatureSupportLevelContextProvider: React.FC<{
  children: React.ReactNode;
  value: NewFeatureSupportLevelData;
}> = ({ value, children }) => {
  return (
    <NewFeatureSupportLevelContext.Provider value={value}>
      {children}
    </NewFeatureSupportLevelContext.Provider>
  );
};

export const useNewFeatureSupportLevel = () => {
  const context = React.useContext(NewFeatureSupportLevelContext);
  if (!context) {
    throw new Error(
      'useNewFeatureSupportLevel must be used within NewFeatureSupportLevelContextProvider.',
    );
  }
  return context;
};
