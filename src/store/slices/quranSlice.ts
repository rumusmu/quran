import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchSurahVerses, fetchSurahs, fetchVerseById } from '../../api/quranApi';
import type { RootState } from '../store';
import type { Surah, Verse } from '../../api/types';

interface QuranState {
  surahs: Surah[];
  currentSurah: number;
  currentSurahId: number | null;
  currentVerse: Verse | null;
  verses: Verse[]; 
  allVerses: Verse[]; 
  loading: boolean;
  error: string | null;
}

const initialState: QuranState = {
  surahs: [],
  currentSurah: 1,
  currentSurahId: null,
  currentVerse: null,
  verses: [],
  allVerses: [],
  loading: false,
  error: null,
};


export const fetchAllSurahs = createAsyncThunk('quran/fetchAllSurahs', async () => {
  return await fetchSurahs();
});


export const fetchVerses = createAsyncThunk(
  'quran/fetchVerses',
  async ({ surahId, authorId }: { surahId: number; authorId?: number }) => {
    return await fetchSurahVerses(surahId, authorId);
  }
);


export const fetchVerse = createAsyncThunk(
  'quran/fetchVerse',
  async ({ surahId, verseNumber }: { surahId: number; verseNumber: number }) => {
    return await fetchVerseById(surahId, verseNumber);
  }
);


export const fetchAllVerses = createAsyncThunk(
  'quran/fetchAllVerses',
  async (authorId?: number) => {
    const allSurahs = await fetchSurahs();

    const versesPromises = allSurahs.map((surah) => fetchSurahVerses(surah.id, authorId));
    const versesArray = await Promise.all(versesPromises);

    return versesArray.flat();
  }
);

const quranSlice = createSlice({
  name: 'quran',
  initialState,
  reducers: {
    setCurrentSurah: (state, action) => {
      state.currentSurah = action.payload;
    },
    setBookCurrentSurahId: (state, action) => {
      state.currentSurahId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllSurahs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllSurahs.fulfilled, (state, action) => {
        state.surahs = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllSurahs.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch surahs';
        state.loading = false;
      })

      // Handle fetchVerses
      .addCase(fetchVerses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVerses.fulfilled, (state, action) => {
        state.verses = action.payload;
        state.loading = false;
      })
      .addCase(fetchVerses.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch verses';
        state.loading = false;
      })

      // Handle fetchVerse
      .addCase(fetchVerse.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVerse.fulfilled, (state, action) => {
        state.currentVerse = action.payload;
        state.loading = false;
      })
      .addCase(fetchVerse.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch verse';
        state.loading = false;
      })

      // Handle fetchAllVerses
      .addCase(fetchAllVerses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllVerses.fulfilled, (state, action) => {
        state.allVerses = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllVerses.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch all verses';
        state.loading = false;
      });
  },
});

export const { setCurrentSurah, setBookCurrentSurahId } = quranSlice.actions;

export const selectSurahs = (state: RootState) => state.quran.surahs;
export const selectCurrentSurah = (state: RootState) => state.quran.currentSurah;
export const selectCurrentVerse = (state: RootState) => state.quran.currentVerse;
export const selectVerses = (state: RootState) => state.quran.verses;
export const selectAllVerses = (state: RootState) => state.quran.allVerses;
export const selectLoading = (state: RootState) => state.quran.loading;
export const selectBookCurrentSurahId = (state: RootState) => state.quran.currentSurahId;
export default quranSlice.reducer;
