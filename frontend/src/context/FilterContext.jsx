import React, { createContext, useContext, useState } from 'react';

const FilterContext = createContext(null);

export const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    ministry: '',
    sector: '',
    state: '',
    status: ''
  });

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      ministry: '',
      sector: '',
      state: '',
      status: ''
    });
  };

  return (
    <FilterContext.Provider value={{ filters, updateFilter, clearFilters }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => useContext(FilterContext);
