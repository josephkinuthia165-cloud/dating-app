import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProfileDetail from './pages/ProfileDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import './index.css';

function App() {
  const [genderFilter, setGenderFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');

  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar
          onGenderFilter={setGenderFilter}
          onLocationFilter={setLocationFilter}
          activeGender={genderFilter}
          activeLocation={locationFilter}
        />
        <Routes>
          <Route path="/" element={<Home genderFilter={genderFilter} locationFilter={locationFilter} />} />
          <Route path="/profile/:id" element={<ProfileDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
