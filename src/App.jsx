import React from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import About from './pages/About'
import Attendance from './pages/Attendance'
import Community from './pages/Community'
import StudyGroup from './pages/StudyGroup'
import Login from './features/auth/Login'
import SignUp from './features/auth/SignUp'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import { AuthProvider } from './context/AuthContext'
import { useAnalytics } from './hooks/useAnalytics'

function AppRoutes() {
    useAnalytics() // Log visits

    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/community" element={<Community />} />
                <Route path="/study" element={<StudyGroup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<Admin />} />
            </Route>
        </Routes>
    )
}

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    )
}

export default App
