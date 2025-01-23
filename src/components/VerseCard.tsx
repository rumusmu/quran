import React, { useState, useEffect } from 'react';
import { Share2, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import type { Verse } from '../api/types';
import { ShareMenu } from './ShareMenu';
import { useTranslations } from '../translations';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentSurah, selectSurahs } from '../store/slices/quranSlice';
import { selectSearchLanguage } from '../store/slices/searchSlice';
import { selectReadingType } from '../store/slices/uiSlice';
import { selectSelectedAuthor } from '../store/slices/translationsSlice';

interface VerseCardProps {
  verse: Verse;
}

export function VerseCard({ verse }: VerseCardProps) {
  const t = useTranslations();
  const language = useSelector(selectSearchLanguage);
  const readingType = useSelector(selectReadingType);
  const [showTranslations, setShowTranslations] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const currentSurah = useSelector(selectCurrentSurah);
  const surahs = useSelector(selectSurahs);
  const { surahId, verseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedAuthor = useSelector(selectSelectedAuthor);

  const selectedSurah = surahs.find((surah) => surah.id === currentSurah);
  const verseInfo = `${selectedSurah?.name}, Verse ${verse.verse_number}`;
  const verseText = `\n${verse.translation?.text || ''}`;
  const verseLink = selectedAuthor
    ? `/surah/${verse.surah_id}/verse/${verse.verse_number}/${selectedAuthor.id}`
    : `/surah/${verse.surah_id}/verse/${verse.verse_number}`;

  useEffect(() => {
    if (surahId && verseId) {
      if (verse.surah_id === Number(surahId) && verse.verse_number === Number(verseId)) {
        setTimeout(() => {
          const verseElement = document.querySelector(`[data-verse-id="${verse.id}"]`);
          if (verseElement) {
            verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            verseElement.classList.add('bg-blue-50', 'dark:bg-blue-900/20');
            setTimeout(() => {
              verseElement.classList.remove('bg-blue-50', 'dark:bg-blue-900/20');
            }, 2000);
          }
        }, 500);
      }
    }
  }, [surahId, verseId, verse.id, verse.surah_id, verse.verse_number]);

  if (readingType === 'book') {
    return null;
  }

  return (
    <>
      {verse.verse_number === 1 && (
        <section className="mb-6 relative">
          <h1 className="text-center relative">
            <span className="absolute left-0 top-1/2 w-1/4 h-px bg-gradient-to-r from-transparent to-gray-300 dark:to-gray-600"></span>
            <span className="inline-flex flex-col items-center px-4">
              {/*<span className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">{selectedSurah?.name_en}</span>*/}
              <span className="font-arabic text-2xl text-gray-800 dark:text-gray-200">{selectedSurah?.name}</span>
            </span>
            <span className="absolute right-0 top-1/2 w-1/4 h-px bg-gradient-to-l from-transparent to-gray-300 dark:to-gray-600"></span>
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 text-center">
            {t.verse.juz} {verse.juz_number} • {t.verse.page} {verse.page}
          </p>
        </section>
      )}

      <div 
        data-verse-id={verse.id}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-xl dark:shadow-gray-900/50 p-6 transition-all duration-300 border border-gray-100/50 dark:border-gray-700/50"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 p-3 rounded-xl">
              <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <Link 
                to={verseLink}
                className="group text-lg font-medium text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                {t.verse.verse} {verse.verse_number}
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t.verse.juz} {verse.juz_number} • {t.verse.page} {verse.page}
              </p>
            </div>
          </div>
          <div className="relative flex items-center gap-2">
            <button
              onClick={() => setShowShareMenu(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
              title={t.share.share}
            >
              <Share2 className="w-4 h-4" />
              <span>{t.share.share}</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <p className="text-3xl leading-relaxed text-right font-arabic text-gray-900 dark:text-white" dir="rtl">
            {verse.verse}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed">
            {language === 'en' ? verse.transcription_en : verse.transcription}
          </p>
          {verse.translation && (
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
                {verse.translation.text}
              </p>
              {verse.translation.footnotes && verse.translation.footnotes.length > 0 && (
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => setShowTranslations(!showTranslations)}
                    className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                  >
                    <span>{showTranslations ? t.verse.hideFootnotes : t.verse.showFootnotes}</span>
                    {showTranslations ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {showTranslations && (
                    <div className="pl-4 border-l-2 border-emerald-200 dark:border-emerald-800 space-y-2">
                      {verse.translation.footnotes.map((footnote) => (
                        <p key={footnote.id} className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            [{footnote.number}]
                          </span>{' '}
                          {footnote.text}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ShareMenu
        isOpen={showShareMenu}
        onClose={() => setShowShareMenu(false)}
        verseText={verseText}
        verseInfo={verseInfo}
        verseLink={verseLink}
      />
    </>
  );
}
