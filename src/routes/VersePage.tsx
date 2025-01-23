import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BookLayout } from '../components/BookLayout';
import { selectAllVerses, setBookCurrentSurahId } from '../store/slices/quranSlice';
import { AppDispatch } from '../store/store';

export function VersePage() {
  const { surahId, verseId } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const allVerses = useSelector(selectAllVerses);

  useEffect(() => {
    if (surahId) {
      dispatch(setBookCurrentSurahId(Number(surahId)));
    }

    if (verseId) {
      setTimeout(() => {
        const verseElement = document.querySelector(`[data-verse-id="${verseId}"]`);
        if (verseElement) {
          verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          verseElement.classList.add('bg-blue-50', 'dark:bg-blue-900/20');
          setTimeout(() => {
            verseElement.classList.remove('bg-blue-50', 'dark:bg-blue-900/20');
          }, 2000);
        }
      }, 100);
    }
  }, [surahId, verseId, dispatch]);

  return <BookLayout verses={allVerses} />;
} 