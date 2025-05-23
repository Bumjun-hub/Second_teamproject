import MainPage from './pages/mainpage/MainPage2';

import './App.css';
<<<<<<< HEAD

import { Route, Router, Routes} from 'react-router-dom';
=======
import MainPage from './pages/MainPage';
import { Route, Routes } from 'react-router-dom';
>>>>>>> 2e186be892559789808400db4efd2f32f266159d
import GroupBuyPage from './pages/GroupBuyPage';
import BoardPage from './pages/BoardPage';
import RecipePage from './pages/RecipePage';
import HotItemPage from './pages/HotItemPage';
import LoginPage from './pages/LoginPage';
import Header from './components/Header';
import Layout from './components/Layout';

function App() {
  return (
<<<<<<< HEAD
=======
    <Layout>
>>>>>>> 2e186be892559789808400db4efd2f32f266159d
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/groupbuy" element={<GroupBuyPage />} />
        <Route path="/board" element={<BoardPage />} />
        <Route path="/recipe" element={<RecipePage />} />
        <Route path="/popular" element={<HotItemPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
<<<<<<< HEAD
=======
    </Layout>

>>>>>>> 2e186be892559789808400db4efd2f32f266159d
  );
}

export default App;
