import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  User,
  Settings,
  LogOut,
  ChevronDown,
  GraduationCap,
  Calendar,
  Bell,
  Inbox,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { fetchNotifications } from '../../services/dashboardService';

const TODAY_FORMATTED = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}).format(new Date());

export const TeacherHeader = ({ onOpenMobile }) => {
  const { userProfile, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const teacherUid = currentUser?.uid || userProfile?.uid;
  const displayName = userProfile?.fullName || currentUser?.displayName || 'Teacher';
  const displayEmail = userProfile?.email || currentUser?.email || '';

  // Load real notifications from Firestore
  useEffect(() => {
    let isMounted = true;
    if (teacherUid) {
      fetchNotifications(teacherUid).then((list) => {
        if (isMounted) setNotifications(list);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [teacherUid]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Menu button + Brand Tagline */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex flex-col">
          <span className="text-xs font-bold text-slate-900 tracking-tight">SmartEval</span>
          <span className="text-[11px] text-slate-500 font-medium">Smarter Evaluation. Better Learning.</span>
        </div>
      </div>

      {/* Center: Current date */}
      <div className="hidden md:flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/60">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-medium text-slate-700">{TODAY_FORMATTED}</span>
        </div>
      </div>

      {/* Right: Notifications + Welcome user + Profile Avatar Dropdown */}
      <div className="flex items-center gap-3">
        {/* Real Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen((prev) => !prev)}
            aria-label="View notifications"
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl py-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">
                  {notifications.length} Total
                </span>
              </div>

              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">You're all caught up!</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Real alerts for OCR completion, student evaluation updates, and account events will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3 text-xs hover:bg-slate-50 transition-colors">
                      <div className="font-semibold text-slate-900">{n.title}</div>
                      <div className="text-slate-600 text-[11px] mt-0.5">{n.message || n.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Identity */}
        <div className="hidden sm:block text-right">
          <p className="text-xs font-bold text-slate-900 leading-tight">Welcome, {displayName}</p>
          <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider flex items-center justify-end gap-1">
            <GraduationCap className="w-3 h-3" />
            Teacher / Evaluator
          </p>
        </div>

        {/* Profile Avatar Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen}
            className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-card py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                <p className="text-[11px] text-slate-500 font-mono truncate">{displayEmail}</p>
              </div>

              <div className="py-1">
                <Link
                  to="/teacher/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Profile</span>
                </Link>

                <Link
                  to="/teacher/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Settings</span>
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TeacherHeader;
