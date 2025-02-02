import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

export type ReadingType = 'card' | 'book';
export type ViewType = 'meal' | 'meal+kuran' | 'kuran+meal' | 'kuran';

interface UIState {
  isDarkMode: boolean;
  language: 'tr' | 'en';
  readingType: ReadingType;
  viewType: ViewType;
}

const savedTheme = localStorage.getItem('isDarkMode');
const savedLanguage = localStorage.getItem('language');
const savedReadingType = localStorage.getItem('readingType');
const savedViewType = localStorage.getItem('viewType');
const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

const initialState: UIState = {
  isDarkMode: savedTheme ? JSON.parse(savedTheme) : prefersDarkMode,
  language: savedLanguage as 'tr' | 'en' || 'en',
  readingType: (savedReadingType as ReadingType) || 'book',
  viewType: (savedViewType as ViewType) || 'meal',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
      localStorage.setItem('isDarkMode', JSON.stringify(state.isDarkMode));
      
      if (state.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setLanguage: (state, action: PayloadAction<'tr' | 'en'>) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },
    toggleLanguage: (state) => {
      const newLanguage = state.language === 'tr' ? 'en' : 'tr';
      state.language = newLanguage;
      localStorage.setItem('language', newLanguage);
    },
    setReadingType: (state, action: PayloadAction<ReadingType>) => {
      state.readingType = action.payload;
      localStorage.setItem('readingType', action.payload);
    },
    setViewType: (state, action: PayloadAction<ViewType>) => {
      state.viewType = action.payload;
      localStorage.setItem('viewType', action.payload);
    },
  },
});

if (initialState.isDarkMode) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

export const { 
  toggleTheme, 
  setLanguage, 
  toggleLanguage,
  setReadingType,
  setViewType
} = uiSlice.actions;

export const selectIsDarkMode = (state: RootState) => state.ui.isDarkMode;
export const selectLanguage = (state: RootState) => state.ui.language;
export const selectReadingType = (state: RootState) => state.ui.readingType;
export const selectViewType = (state: RootState) => state.ui.viewType;

export default uiSlice.reducer;