import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useSelector,useDispatch } from 'react-redux';
import { selectSurahs } from '../store/slices/quranSlice';
import { Verse } from '../api/types';
import { useTranslations } from '../translations';
import { selectBookCurrentSurahId, setBookCurrentSurahId  } from '../store/slices/quranSlice';
interface BookLayoutProps {
  verses: Verse[];
}

export const BookLayout: React.FC<BookLayoutProps> = ({ verses }) => {
  const dispatch = useDispatch();
  const currentSurahId = useSelector(selectBookCurrentSurahId);
  const t = useTranslations();
  const surahs = useSelector(selectSurahs);
  const [currentPage, setCurrentPage] = useState(0);
  //const [currentSurahId, setCurrentSurahId] = useState<number | null>(null);
  const [showFootnotes, setShowFootnotes] = useState<{ [key: number]: boolean }>({});
  const [inputPage, setInputPage] = useState('0');
  const [searchSurah, setSearchSurah] = useState('');
  const [searchVerse, setSearchVerse] = useState('');
  const [showSurahDropdown, setShowSurahDropdown] = useState(false);
  const [showVerseDropdown, setShowVerseDropdown] = useState(false);
  const [filteredSurahs, setFilteredSurahs] = useState(surahs);
  const [availableVerses, setAvailableVerses] = useState<number[]>([]);

  const totalPages = Math.max(...verses.map((verse) => verse.page));
  const currentPageVerses = verses.filter((verse) => verse.page === currentPage);
  const versesBySurah = currentPageVerses.reduce((acc, verse) => {
    if (!acc[verse.surah_id]) {
      acc[verse.surah_id] = [];
    }
    acc[verse.surah_id].push(verse);
    return acc;
  }, {} as { [key: number]: Verse[] });

  useEffect(() => {
    const selectedSurah = surahs.find(s => s.name === searchSurah);
    if (selectedSurah) {
      const surahVerses = verses.filter(v => v.surah_id === selectedSurah.id);
      const verseNumbers = [...new Set(surahVerses.map(v => v.verse_number))];
      setAvailableVerses(verseNumbers.sort((a, b) => a - b));
    }
  }, [searchSurah, verses]);

  useEffect(() => {
    if (searchSurah) {
      const filtered = surahs.filter(s => 
        s.name.toLowerCase().includes(searchSurah.toLowerCase())
      );
      setFilteredSurahs(filtered);
    } else {
      setFilteredSurahs(surahs);
    }
  }, [searchSurah, surahs]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.surah-dropdown') && !target.closest('.surah-input')) {
        setShowSurahDropdown(false);
      }
      if (!target.closest('.verse-dropdown') && !target.closest('.verse-input')) {
        setShowVerseDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const targetSurah = surahs.find(s => s.name === searchSurah);
    
    if (targetSurah) {
      const targetVerse = verses.find(v => 
        v.surah_id === targetSurah.id && 
        v.verse_number === Number(searchVerse)
      );

      if (targetVerse) {
        setCurrentPage(targetVerse.page);
        setInputPage(targetVerse.page.toString());
        window.scrollTo(0, 0);
        
        setTimeout(() => {
          const verseElement = document.querySelector(`[data-verse-id="${targetVerse.id}"]`);
          if (verseElement) {
            verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            verseElement.classList.add('bg-blue-50', 'dark:bg-blue-900/20');
            setTimeout(() => {
              verseElement.classList.remove('bg-blue-50', 'dark:bg-blue-900/20');
            }, 2000);
          }
        }, 100);
      }
    }
    setShowSurahDropdown(false);
    setShowVerseDropdown(false);
  };

  const updateCurrentSurah = () => {
    const verseElements = document.querySelectorAll('[data-surah-id]');
    const headerHeight = 200;
    
    let currentSurah = null;
    for (const element of verseElements) {
      const rect = element.getBoundingClientRect();
      const surahId = Number(element.getAttribute('data-surah-id'));
      
      if (rect.top <= headerHeight) {
        currentSurah = surahId;
      }
    }
    
    if (currentSurah !== null && currentSurah !== currentSurahId) {
      dispatch(setBookCurrentSurahId(currentSurah));
      const currentSurahName = surahs.find(s => s.id === currentSurah)?.name || '';
      setSearchSurah(currentSurahName);
    }
  };


  useEffect(() => {
    window.addEventListener('scroll', updateCurrentSurah);
    updateCurrentSurah();

    return () => {
      window.removeEventListener('scroll', updateCurrentSurah);
    };
  }, [currentPage]);

  useEffect(() => {
    if (currentPageVerses.length > 0) {
      const firstSurahId = currentPageVerses[0].surah_id;
      dispatch(setBookCurrentSurahId(firstSurahId));
    }
  }, [currentPage, dispatch]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      setInputPage((prev) => (Number(prev) + 1).toString());
      window.scrollTo(0, 0);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
      setInputPage((prev) => (Number(prev) - 1).toString());
      window.scrollTo(0, 0);
    }
  };

  const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputPage(value);
    const pageNumber = Number(value);
    if (!isNaN(pageNumber) && pageNumber >= 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo(0, 0);
    }
  };

  const toggleFootnote = (verseId: number) => {
    setShowFootnotes((prev) => ({ ...prev, [verseId]: !prev[verseId] }));
  };

  const getCurrentSurahName = () => {
    if (!currentSurahId) return t.sidebar.selectSurah;
    const surah = surahs.find(s => s.id === currentSurahId);
    return surah?.name || t.sidebar.selectSurah;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="sticky top-16 bg-white dark:bg-gray-800 z-10 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {getCurrentSurahName()}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t.verse.page} {currentPage} {t.verse.of} {totalPages}
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex justify-center items-center gap-2 mb-4">
            <div className="relative surah-dropdown">
              <input
                type="text"
                value={searchSurah}
                onChange={(e) => {
                  setSearchSurah(e.target.value);
                  setShowSurahDropdown(true);
                }}
                onFocus={() => setShowSurahDropdown(true)}
                placeholder={t.sidebar.selectSurah}
                className="surah-input px-3 py-1 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
              {showSurahDropdown && (
                <div className="absolute top-full left-0 w-full mt-1 max-h-60 overflow-y-auto bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-lg z-50">
                  {filteredSurahs.map((surah) => (
                    <button
                      key={surah.id}
                      type="button"
                      onClick={() => {
                        setSearchSurah(surah.name);
                        setShowSurahDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                    >
                      {surah.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative verse-dropdown">
              <input
                type="text"
                value={searchVerse}
                onChange={(e) => setSearchVerse(e.target.value)}
                onFocus={() => setShowVerseDropdown(true)}
                placeholder={t.verse.verse}
                className="verse-input w-20 px-3 py-1 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
              {showVerseDropdown && availableVerses.length > 0 && (
                <div className="absolute top-full left-0 w-32 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-lg z-50">
                  {availableVerses.map((verseNum) => (
                    <button
                      key={verseNum}
                      type="button"
                      onClick={() => {
                        setSearchVerse(verseNum.toString());
                        setShowVerseDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                    >
                      {verseNum}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <Search className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </form>

          <div className="flex justify-center items-center gap-4">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>

            <input
              type="text"
              value={inputPage}
              onChange={handlePageChange}
              className="w-16 text-center px-2 py-1 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {Object.entries(versesBySurah).map(([surahId, surahVerses]) => (
            <div key={surahId} data-surah-id={surahId}>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                {surahs.find(s => s.id === Number(surahId))?.name}
              </h2>
              {surahVerses.map((verse) => (
                <div key={verse.id} data-verse-id={verse.id} className="transition-colors duration-500">
                  <p className="text-gray-800 dark:text-gray-200">
                    <span className="text-gray-700 dark:text-gray-300">
                      {verse.translation?.text}{' '}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 font-bold">
                      ﴾{verse.verse_number}﴿
                    </span>
                  </p>

                  {verse.translation?.footnotes?.length > 0 && (
                    <button
                      onClick={() => toggleFootnote(verse.id)}
                      className="text-sm text-blue-600 dark:text-blue-400 underline mt-1"
                    >
                      {showFootnotes[verse.id] ? t.verse.hideFootnotes : t.verse.showFootnotes}
                    </button>
                  )}

                  {showFootnotes[verse.id] && verse.translation?.footnotes && (
                    <div className="mt-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                      {verse.translation.footnotes.map((footnote) => (
                        <p key={footnote.id} className="text-sm text-gray-600 dark:text-gray-400 italic">
                          [{footnote.number}] {footnote.text}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};