// src/components/leads/LeadAnalysis.tsx
import { useState } from 'react';
import { api } from '~/utils/api';

interface LeadAnalysisProps {
  leadId: number;
  leadName: string;
  website: string;
  onAnalysisComplete?: () => void;
}

export default function LeadAnalysis({ 
  leadId, 
  leadName, 
  website,
  onAnalysisComplete 
}: LeadAnalysisProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const analyzeLead = api.leads.analyzeLead.useMutation({
    onSuccess: () => {
      if (onAnalysisComplete) {
        onAnalysisComplete();
      }
    },
  });

  const handleAnalyze = async () => {
    try {
      await analyzeLead.mutateAsync({ id: leadId });
    } catch (error) {
      console.error('Error analyzing lead:', error);
    }
  };

  return (
    <div className="rounded-lg bg-gray-800 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">AI Lead Analysis</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded-md bg-gray-700 p-1 text-gray-300 hover:bg-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="rounded-md bg-gray-700 p-4">
            <p className="text-gray-300">
              Run an AI analysis on{' '}
              <span className="font-semibold text-white">{leadName}</span> to automatically
              determine their interest in AI technologies.
            </p>
            <div className="mt-2">
              <span className="text-sm text-gray-400">Website: </span>
              <a
                href={website.startsWith('http') ? website : `https://${website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                {website}
              </a>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <p className="text-sm text-gray-400">The AI analysis will:</p>
            <ul className="ml-4 list-disc space-y-1 text-sm text-gray-300">
              <li>Scan the company website for AI-related content</li>
              <li>Detect signals of AI interest and readiness</li>
              <li>Determine industry and company size if not provided</li>
              <li>Automatically score and qualify the lead</li>
              <li>Extract relevant evidence to support the analysis</li>
            </ul>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={analyzeLead.isLoading}
            className="w-full rounded-md bg-gradient-to-r from-orange-300 via-pink-500 to-purple-400 px-4 py-2 font-medium text-white shadow-md hover:from-orange-400 hover:via-pink-600 hover:to-purple-500 disabled:opacity-50"
          >
            {analyzeLead.isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-2">Analyzing...</span>
              </div>
            ) : (
              'Run AI Analysis'
            )}
          </button>

          {analyzeLead.isError && (
            <div className="rounded-md bg-red-900/50 p-3 text-sm text-red-200">
              <p>Error: {analyzeLead.error?.message || 'Failed to analyze lead'}</p>
            </div>
          )}

          {analyzeLead.isSuccess && (
            <div className="rounded-md bg-green-900/50 p-3 text-sm text-green-200"></div>