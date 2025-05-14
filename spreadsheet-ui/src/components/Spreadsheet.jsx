// src/components/Spreadsheet.jsx
import { useState } from 'react';

export default function Spreadsheet() {
  // — Columns + rows state
  const [columns, setColumns] = useState([
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName',  label: 'Last Name'  },
    { key: 'major',     label: 'Major'      },
    { key: 'category',  label: 'Category'   },
  ]);

  const [rows, setRows] = useState([
    { id: 1, firstName: 'Alice', lastName: 'Wang',   major: 'Computer Engineering',  category: '' },
    { id: 2, firstName: 'Bob',   lastName: 'Smith',  major: 'Art History',           category: '' },
    { id: 3, firstName: 'Carol', lastName: 'Garcia', major: 'Mechanical Engineering', category: '' },
  ]);

  // — UI state
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // — Add / remove rows & columns
  const addRow = () => {
    const nextId = rows.length ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    setRows([...rows, { id: nextId, firstName:'', lastName:'', major:'', category:'' }]);
  };
  const removeRow = () => setRows(rows.slice(0, -1));

  const addColumn = () => {
    const key = `col${columns.length}`;
    setColumns([...columns, { key, label: `Column ${columns.length}` }]);
    setRows(rows.map(r => ({ ...r, [key]: '' })));
  };
  const removeColumn = () => {
    if (columns.length <= 1) return;
    const removed = columns[columns.length - 1].key;
    setColumns(columns.slice(0, -1));
    setRows(rows.map(r => {
      const copy = { ...r };
      delete copy[removed];
      return copy;
    }));
  };

  // — Update a cell's value
  const onCellChange = (id, key, value) => {
    setRows(rows.map(r => r.id === id ? { ...r, [key]: value } : r));
  };

  // — Call the backend to classify "major" → "category"
  const classifyMajors = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = rows.map(r => r.major);
      const res = await fetch('http://localhost:8000/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ majors: payload }),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const { categories } = await res.json();
      setRows(rows.map((r, i) => ({ ...r, category: categories[i] })));
    } catch (err) {
      console.error(err);
      setError('Failed to classify majors. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-700">Student Records</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={classifyMajors}
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white font-medium flex items-center
              ${loading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Classifying...
              </>
            ) : 'Classify Majors'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-md overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(col => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-2 whitespace-nowrap">
                    <input
                      className={`w-full py-1 px-2 border rounded focus:outline-none focus:ring-1 focus:ring-indigo-500
                        ${col.key === 'category' ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                      value={row[col.key] || ''}
                      onChange={e => onCellChange(row.id, col.key, e.target.value)}
                      disabled={col.key === 'category'}
                      placeholder={`Enter ${col.label}...`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-between">
        <div className="flex space-x-3">
          <button
            onClick={addRow}
            className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm font-medium flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Row
          </button>
          <button
            onClick={removeRow}
            className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm font-medium flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
            Remove Row
          </button>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={addColumn}
            className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm font-medium flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Column
          </button>
          <button
            onClick={removeColumn}
            className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm font-medium flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
            Remove Column
          </button>
        </div>
      </div>
    </div>
  );
}
