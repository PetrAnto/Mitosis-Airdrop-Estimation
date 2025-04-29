import React from 'react';

const AllocationCard = ({ title, subtitle, value, usdValue }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 w-full max-w-md border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500 mb-2">{subtitle}</p>
      <p className="text-2xl font-bold text-purple-600">{value}</p>
      {usdValue && (
        <p className="text-sm text-gray-500">≈ ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      )}
    </div>
  );
};

export default AllocationCard;
