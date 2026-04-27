import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {CinematicStage} from './components/CinematicStage';
import {CategoryPage} from './pages/CategoryPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <main className="page-shell" id="top">
              <CinematicStage />
            </main>
          }
        />
        <Route path="/:categoryId" element={<CategoryPage />} />
      </Routes>
    </BrowserRouter>
  );
}
