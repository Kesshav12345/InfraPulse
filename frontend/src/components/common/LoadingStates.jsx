import React from 'react';
import { AlertCircle, RefreshCw, FolderSearch } from 'lucide-react';

export function LoadingSkeleton({ count = 4, height = 'h-16' }) {
  return (
    <div className="w-full space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`w-full bg-slate-200 rounded ${height}`} />
      ))}
    </div>
  );
}

export function EmptyState({ title = 'No records found', description = 'Try adjusting your search criteria or filters.', onReset = null }) {
  return (
    <div className="gov-card p-12 text-center flex flex-col items-center justify-center">
      <div className="p-3 bg-slate-100 rounded-full text-slate-400 mb-3">
        <FolderSearch size={28} />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-md">{description}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="mt-4 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}

export function ErrorState({ title = 'Unable to load data', message = 'Please check your connection and retry.', onRetry = null }) {
  return (
    <div className="gov-card p-10 text-center flex flex-col items-center justify-center border-red-200 bg-red-50/30">
      <div className="p-3 bg-red-100 rounded-full text-red-600 mb-3">
        <AlertCircle size={28} />
      </div>
      <h3 className="text-base font-semibold text-red-900">{title}</h3>
      <p className="text-sm text-red-700 mt-1 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-700 hover:bg-red-800 rounded"
        >
          <RefreshCw size={13} />
          Retry
        </button>
      )}
    </div>
  );
}
