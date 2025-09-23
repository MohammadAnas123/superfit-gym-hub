
import { useState } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import AuthDialog from './AuthDialog';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { supabase } from "../lib/supabaseClient";

console.log("Hello"+supabase); 

const Header = () => {
  console.log('Header component rendering');
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut, loading } = useAuth();

  console.log('Header: user state', user, 'loading', loading);

  const navigation = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Packages', href: '#packages' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Contact', href: '#contact' },
  ];

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <header className="bg-black text-white fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-red-500">SUPERFIT</h1>
            </div>
            <div className="text-white">Loading...</div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-black text-white fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-red-500">SUPERFIT</h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-white hover:text-red-500 transition-colors duration-200"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex space-x-4 items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-white">Welcome, {user.email}</span>
                <Button
                  onClick={signOut}
                  variant="ghost"
                  className="text-white hover:text-red-500"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <AuthDialog>
                  <button className="text-white hover:text-red-500 transition-colors">
                    Member Login
                  </button>
                </AuthDialog>
                <AuthDialog isAdmin>
                  <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">
                    Admin Login
                  </button>
                </AuthDialog>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-red-500"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-white hover:text-red-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-4 space-y-2">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-white">Welcome, {user.email}</div>
                    <Button
                      onClick={signOut}
                      variant="ghost"
                      className="w-full text-left px-3 py-2 text-white hover:text-red-500"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <>
                    <AuthDialog>
                      <button className="block w-full text-left px-3 py-2 text-white hover:text-red-500">
                        Member Login
                      </button>
                    </AuthDialog>
                    <AuthDialog isAdmin>
                      <button className="block w-full text-left px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                        Admin Login
                      </button>
                    </AuthDialog>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
