import React from 'react';
import { Book, AlignVerticalSpaceAround  } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { selectReadingType, setReadingType } from '../store/slices/uiSlice';

export type ReadingType = 'card' | 'book';

export function ReadingTypeSelector() {
  const dispatch = useDispatch();
  const currentType = useSelector(selectReadingType);

  return (
    <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <button
        onClick={() => dispatch(setReadingType('card'))}
        className={`p-2 rounded-md transition-all ${
          currentType === 'card'
            ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-600 dark:text-emerald-400'
            : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
        }`}
        title="Card View"
      >
        <AlignVerticalSpaceAround className="w-4 h-4" />
      </button>
      <button
        onClick={() => dispatch(setReadingType('book'))}
        className={`p-2 rounded-md transition-all ${
          currentType === 'book'
            ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-600 dark:text-emerald-400'
            : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
        }`}
        title="Book View"
      >
        <Book className="w-4 h-4" />
      </button>
    </div>
  );
}