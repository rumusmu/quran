import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, ChevronUp, ChevronDown, Settings, Loader2 } from 'lucide-react';
import { useSelector,useDispatch } from 'react-redux';
import { selectSurahs } from '../store/slices/quranSlice';
import { Verse } from '../api/types';
import { useTranslations } from '../translations';
import { selectBookCurrentSurahId, setBookCurrentSurahId  } from '../store/slices/quranSlice';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { selectSelectedAuthor, selectTranslationsLoading } from '../store/slices/translationsSlice';

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
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [showSettings, setShowSettings] = useState(false);
  const { surahId, verseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoading = useSelector(selectTranslationsLoading);
  const selectedAuthor = useSelector(selectSelectedAuthor);

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
      
      //otomatik surah seçip inputa yazdırma
      // const currentSurahName = surahs.find(s => s.id === currentSurah)?.name || '';
      // setSearchSurah(currentSurahName);
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

  useEffect(() => {
    if (surahId && verseId) {
      const targetVerse = verses.find(
        v => v.surah_id === Number(surahId) && v.verse_number === Number(verseId)
      );
      
      if (targetVerse) {
        setCurrentPage(targetVerse.page);
        setInputPage(targetVerse.page.toString());
        
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
    } else if (surahId) {
      const firstVerseOfSurah = verses.find(v => v.surah_id === Number(surahId));
      if (firstVerseOfSurah) {
        setCurrentPage(firstVerseOfSurah.page);
        setInputPage(firstVerseOfSurah.page.toString());
        window.scrollTo(0, 0);
      }
    }
  }, [surahId, verseId, verses]);

  // Sayfa veya sure değiştiğinde URL'yi kontrol et
  useEffect(() => {
    // Eğer şu an bir sure/ayet URL'indeyse
    if (location.pathname.includes('/surah/')) {
      const currentVerse = verses.find(
        v => v.surah_id === Number(surahId) && v.verse_number === Number(verseId)
      );

      // Eğer mevcut sayfa veya sure, URL'deki sure/ayetten farklıysa
      if (currentVerse?.page !== currentPage || currentVerse?.surah_id !== currentSurahId) {
        // URL'yi temizle
        navigate('/', { replace: true });
      }
    }
  }, [currentPage, currentSurahId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-2 sm:p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="flex items-center justify-end gap-2 px-4 py-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-300 group"
            title="Settings"
          >
            <Settings className={`w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform ${showSettings ? 'rotate-45' : ''}`} />
          </button>
          <button
            onClick={() => setIsHeaderVisible(!isHeaderVisible)}
            className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-300 group"
            title={isHeaderVisible ? 'Hide controls' : 'Show controls'}
          >
            {isHeaderVisible ? (
              <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:-translate-y-0.5 transition-transform" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:translate-y-0.5 transition-transform" />
            )}
          </button>
        </div>

        {/* Settings Panel */}
        <div className={`fixed right-4 top-32 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl transition-all duration-300 ${
          showSettings ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
        }`}>
          <div className="p-4 space-y-6 w-72">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {t.settings?.title}
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.settings?.fontSize}
                  </label>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {fontSize}px
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{t.settings?.smaller}</span>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none 
                      [&::-webkit-slider-thumb]:w-3
                      [&::-webkit-slider-thumb]:h-3
                      [&::-webkit-slider-thumb]:bg-emerald-500
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:transition-all
                      [&::-webkit-slider-thumb]:hover:w-4
                      [&::-webkit-slider-thumb]:hover:h-4"
                  />
                  <span className="text-sm text-gray-500">{t.settings?.larger}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.settings?.lineHeight}
                  </label>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {lineHeight.toFixed(1)}x
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{t.settings?.lineHeightTight}</span>
                  <input
                    type="range"
                    min="1"
                    max="2"
                    step="0.1"
                    value={lineHeight}
                    onChange={(e) => setLineHeight(Number(e.target.value))}
                    className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none 
                      [&::-webkit-slider-thumb]:w-3
                      [&::-webkit-slider-thumb]:h-3
                      [&::-webkit-slider-thumb]:bg-emerald-500
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:transition-all
                      [&::-webkit-slider-thumb]:hover:w-4
                      [&::-webkit-slider-thumb]:hover:h-4"
                  />
                  <span className="text-sm text-gray-500">{t.settings?.lineHeightRelaxed}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div 
          className={`sticky top-16 bg-white dark:bg-gray-800 z-10 border-b border-gray-200 dark:border-gray-700 transition-all duration-500 ease-in-out ${
            isHeaderVisible 
              ? 'max-h-[500px] opacity-100' 
              : 'max-h-0 opacity-0 overflow-hidden border-none'
          }`}
        >
          <div className="p-2 sm:p-4">
            <div className="text-center mb-2 sm:mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
              {getCurrentSurahName()}
            </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {t.verse.page} {currentPage} {t.verse.of} {totalPages}
            </p>
          </div>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row justify-center items-center gap-2 mb-4">
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative surah-dropdown flex-1 sm:flex-initial">
              <input
                type="text"
                value={searchSurah}
                onChange={(e) => {
                  setSearchSurah(e.target.value);
                  setShowSurahDropdown(true);
                }}
                onFocus={() => setShowSurahDropdown(true)}
                placeholder={t.sidebar.selectSurah}
                    className="w-full surah-input px-2 sm:px-3 py-1 text-sm sm:text-base border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
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

                <div className="relative verse-dropdown w-24 sm:w-20">
              <input
                type="text"
                value={searchVerse}
                onChange={(e) => setSearchVerse(e.target.value)}
                onFocus={() => setShowVerseDropdown(true)}
                placeholder={t.verse.verse}
                    className="w-full verse-input px-2 sm:px-3 py-1 text-sm sm:text-base border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
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
            </div>

            <button
              type="submit"
                className="w-full sm:w-auto p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            >
                <Search className="w-4 h-4 sm:w-5 sm:h-5 mx-auto text-gray-700 dark:text-gray-300" />
            </button>
          </form>

            <div className="flex justify-center items-center gap-2 sm:gap-4">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
                className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50"
            >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
            </button>

            <input
              type="text"
              value={inputPage}
              onChange={handlePageChange}
                className="w-12 sm:w-16 text-center px-1 sm:px-2 py-1 text-sm sm:text-base border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
                className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>

        <div 
          className={`sticky top-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-10 transition-all duration-500 ${
            isHeaderVisible ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-16 opacity-100 border-b border-gray-200 dark:border-gray-700'
          }`}
        >
          <div className="flex items-center justify-between px-4 py-2">
            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {getCurrentSurahName()} - {t.verse.page} {currentPage}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-6 space-y-6 relative min-h-[400px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-10">
              <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto" />
                <p className="mt-4 text-gray-600 dark:text-gray-300">{t.loading}</p>
              </div>
            </div>
          ) : null}

          {Object.entries(versesBySurah).map(([surahId, surahVerses]) => (
            <div key={surahId} data-surah-id={surahId} 
              className={`transition-opacity duration-300 ${isLoading ? 'opacity-40' : 'opacity-100'}`}
            >
              <div className="flex items-center justify-center mb-6 relative">
                <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
                <h2 className="relative px-6 py-2 bg-white dark:bg-gray-800 text-lg sm:text-xl font-semibold">
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                {surahs.find(s => s.id === Number(surahId))?.name}
                  </span>
              </h2>
              </div>
              
              <div className="space-y-4">
              {surahVerses.map((verse) => (
                <div 
                  key={verse.id}
                  data-verse-id={verse.verse_number}
                  data-surah-id={verse.surah_id}
                  className="transition-colors duration-500"
                >
                  <p className="text-gray-800 dark:text-gray-200">
                      <span 
                        className="text-gray-700 dark:text-gray-300"
                        style={{ 
                          fontSize: `${fontSize}px`,
                          lineHeight: lineHeight
                        }}
                      >
                      {verse.translation?.text}{' '}
                    </span>
                      <span 
                        className="text-gray-600 dark:text-gray-400 font-bold"
                        style={{ 
                          fontSize: `${fontSize * 0.9}px`,
                          lineHeight: lineHeight
                        }}
                      >
                      ﴾{verse.verse_number}﴿
                    </span>
                  </p>

                  {verse.translation?.footnotes?.length > 0 && (
                    <button
                      onClick={() => toggleFootnote(verse.id)}
                        className="text-blue-600 dark:text-blue-400 hover:underline mt-1"
                        style={{ 
                          fontSize: `${fontSize * 0.75}px`
                        }}
                    >
                      {showFootnotes[verse.id] ? t.verse.hideFootnotes : t.verse.showFootnotes}
                    </button>
                  )}

                  {showFootnotes[verse.id] && verse.translation?.footnotes && (
                    <div className="mt-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                      {verse.translation.footnotes.map((footnote) => (
                          <p 
                            key={footnote.id} 
                            className="text-gray-600 dark:text-gray-400 italic"
                            style={{ 
                              fontSize: `${fontSize * 0.8}px`,
                              lineHeight: lineHeight
                            }}
                          >
                          [{footnote.number}] {footnote.text}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};