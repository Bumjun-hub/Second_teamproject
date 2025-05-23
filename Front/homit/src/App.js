// import MainPage from './pages/mainpage/MainPage2';

import './App.css';
import MainPage from './pages/MainPage';
import { Route, Router, Routes} from 'react-router-dom';
import GroupBuyPage from './pages/GroupBuyPage';
import BoardPage from './pages/BoardPage';
import RecipePage from './pages/RecipePage';
import HotItemPage from './pages/HotItemPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/groupbuy" element={<GroupBuyPage />} />
        <Route path="/board" element={<BoardPage />} />
        <Route path="/recipe" element={<RecipePage />} />
        <Route path="/popular" element={<HotItemPage />} />
        <Route path="/login" element={<LoginPage/>} />
      </Routes>
  );
}

export default App;
