
import React from 'react';
import { Citation } from '../types';

interface CitationCardProps {
  citation: Citation;
}

export const CitationCard: React.FC<CitationCardProps> = ({ citation }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all hover:shadow-md dark:hover:shadow-indigo-500/10 flex flex-col sm:flex-row">
      <div className="w-full sm:w-32 h-48 sm:h-auto bg-slate-100 dark:bg-slate-800 flex-shrink-0 relative overflow-hidden group border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800">
        <img 
          src={citation.imageUrl} 
          alt={citation.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
          <span className="text-[10px] text-white font-bold uppercase tracking-widest">Ref #{citation.id}</span>
        </div>
      </div>

      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start gap-2 mb-2">
          <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-[10px]">
            {citation.id}
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-800 uppercase tracking-tighter">
            Halaman {citation.page}
          </span>
        </div>

        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-tight mb-1">
          {citation.title}
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          {citation.authors.join(', ')} ({citation.year}) • {citation.publisher}
        </p>
        
        <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-3 border-l-2 border-indigo-500 mb-3">
          <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
            "{citation.snippet}"
          </p>
        </div>

        <a 
          href={citation.sourceUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors uppercase tracking-wider"
        >
          Akses Sumber
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
};
