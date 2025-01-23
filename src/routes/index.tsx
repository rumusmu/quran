import { createBrowserRouter } from 'react-router-dom';
import { SurahPage } from './SurahPage';
import { VersePage } from './VersePage';
import App from '../App';
import { ErrorPage } from '../components/ErrorPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />
  },
  {
    path: '/surah/:surahId',
    element: <App />,
    errorElement: <ErrorPage />
  },
  {
    path: '/surah/:surahId/verse/:verseId/:authorId?',
    element: <App />,
    errorElement: <ErrorPage />
  },
  {
    path: '*',
    element: <ErrorPage />
  }
]); 