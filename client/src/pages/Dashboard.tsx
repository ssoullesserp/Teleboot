import React from 'react';

export const Dashboard: React.FC = () => {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Dashboard</h3>
          <p className="mt-2 text-sm text-gray-500">
            Bot management interface will be implemented here
          </p>
        </div>
      </div>
    </div>
  );
};