import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Home, Trophy, Users, Calendar, BarChart3, LogOut, User } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout, isOrganizer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/matches', label: 'Matches', icon: Calendar },
    { to: '/leaderboard', label: 'Leaderboard', icon: BarChart3 },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  if (isOrganizer || isAdmin) {
    navLinks.push({ to: '/tournaments', label: 'Tournaments', icon: Trophy });
    navLinks.push({ to: '/teams', label: 'Teams', icon: Users });
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-2">
              <Trophy className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">CricketScore</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-1 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.username} ({user?.role})
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-red-600 hover:text-red-700"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-primary-600"
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            ))}
            <div className="px-3 py-2 text-sm text-gray-600">
              {user?.username} ({user?.role})
            </div>
            <button
              onClick={() => { handleLogout(); setIsOpen(false); }}
              className="flex items-center gap-2 px-3 py-2 text-red-600 w-full"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
