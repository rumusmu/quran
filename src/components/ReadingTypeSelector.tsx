import React from 'react';
import { Book, AlignVerticalSpaceAround } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { selectReadingType, setReadingType } from '../store/slices/uiSlice';

export type ReadingType = 'card' | 'book';

export function ReadingTypeSelector() {
  const dispatch = useDispatch();
  const currentType = useSelector(selectReadingType);

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
        Reading View
      </label>
      <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <button
          onClick={() => dispatch(setReadingType('book'))}
          className={`flex-1 p-2.5 rounded-lg transition-all flex items-center justify-center ${
            currentType === 'book'
              ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-600 dark:text-emerald-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
          }`}
        >
          <Book className="w-4 h-4" />
        </button>
        <button
          onClick={() => dispatch(setReadingType('card'))}
          className={`flex-1 p-2.5 rounded-lg transition-all flex items-center justify-center ${
            currentType === 'card'
              ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-600 dark:text-emerald-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
          }`}
        >
          <AlignVerticalSpaceAround className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}