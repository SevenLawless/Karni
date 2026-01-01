import React from 'react';
import './FilterBar.css';

const CATEGORIES = ['rent', 'utilities', 'groceries', 'dining', 'transport', 'entertainment', 'other'];

function FilterBar({ filters, onFilterChange, onExportCSV }) {
  const handleChange = (name, value) => {
    onFilterChange({
      ...filters,
      [name]: value || undefined
    });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      category: '',
      payer: '',
      startDate: '',
      endDate: ''
    });
  };

  const hasActiveFilters = filters.search || filters.category || filters.payer || filters.startDate || filters.endDate;

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <input
          type="text"
          placeholder="Search by description..."
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          className="filter-input"
        />
      </div>

      <div className="filter-group">
        <select
          value={filters.category || ''}
          onChange={(e) => handleChange('category', e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <select
          value={filters.payer || ''}
          onChange={(e) => handleChange('payer', e.target.value)}
          className="filter-select"
        >
          <option value="">All Payers</option>
          <option value="zaki">Zaki</option>
          <option value="reda">Reda</option>
          <option value="both">Both</option>
        </select>
      </div>

      <div className="filter-group">
        <input
          type="date"
          placeholder="Start Date"
          value={filters.startDate || ''}
          onChange={(e) => handleChange('startDate', e.target.value)}
          className="filter-input"
        />
      </div>

      <div className="filter-group">
        <input
          type="date"
          placeholder="End Date"
          value={filters.endDate || ''}
          onChange={(e) => handleChange('endDate', e.target.value)}
          className="filter-input"
        />
      </div>

      <div className="filter-actions">
        {hasActiveFilters && (
          <button onClick={clearFilters} className="btn-clear">
            Clear Filters
          </button>
        )}
        <button onClick={onExportCSV} className="btn-export">
          Export CSV
        </button>
      </div>
    </div>
  );
}

export default FilterBar;

