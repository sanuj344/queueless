import React from 'react';

export default function EmptyState({ text = "No data found", icon = "📁" }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center text-3xl mb-6 border border-zinc-800 animate-bounce">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{text}</h3>
      <p className="text-sm text-zinc-500 max-w-xs mx-auto">
        We couldn't find any records matching your request. Try adjusting your filters or check back later.
      </p>
    </div>
  );
}
