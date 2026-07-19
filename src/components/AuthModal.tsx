import { useEffect, useState } from 'react';
import { X, Phone, Mail, Lock, User, Eye, EyeOff, KeyRound, Ticket } from 'lucide-react';
import { api, ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';

type AuthMode = 'login' | 'register';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Shared
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);

  // Login
  const [loginPassword, setLoginPassword] = useState('');

  // Register
  const [regLastName, setRegLastName] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regReferral, setRegReferral] = useState('');
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setCodeSent(false);
      setDevCode(null);
      setCode('');
      // Prefill referral code from ?ref= link
      const ref = new URLSearchParams(window.location.search).get('ref');
      if (ref) {
        setRegReferral(ref.replace(/^\//, ''));
        setMode('register');
      }
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const normalizedPhone = (() => {
    const d = phone.replace(/\D/g, '');
    // RU: 8XXXXXXXXXX -> 7XXXXXXXXXX (бэкенд хранит OTP под 7...)
    return d.length === 11 && d.startsWith('8') ? '7' + d.slice(1) : d;
  })();

  const handleRequestCode = async () => {
    setError(null);
    if (normalizedPhone.length < 10) {
      setError('Введите корректный номер телефона');
      return;
    }
    setBusy(true);
    try {
      await api.requestCode(normalizedPhone);
      setCodeSent(true);
      // Dev-режим: SMSC не настроен, код читаем из Redis через debug-эндпоинт
      try {
        const res = await fetch(`/api/v1/auth/debug-code/?phone=${encodeURIComponent(normalizedPhone)}`);
        if (res.ok) {
          const data = await res.json() as { code?: string };
          if (data.code) setDevCode(data.code);
        }
      } catch {
        /* debug endpoint отсутствует — код придёт по SMS */
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Не удалось отправить код');
    } finally {
      setBusy(false);
    }
  };

  const handleLogin = async () => {
    setError(null);
    setBusy(true);
    try {
      await login(normalizedPhone, code, loginPassword);
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Ошибка входа');
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async () => {
    setError(null);
    if (!agreed) {
      setError('Необходимо принять условия соглашения');
      return;
    }
    setBusy(true);
    try {
      await register({
        phone: normalizedPhone,
        code,
        email: regEmail,
        password: regPassword,
        first_name: regFirstName || undefined,
        last_name: regLastName || undefined,
        referral_code: regReferral,
      });
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Ошибка регистрации');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-[430px] bg-white rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto sm:mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div className="w-8" />
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setMode('login')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => setMode('register')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Регистрация
            </button>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Phone + code block (shared) */}
        <div className="px-5 pt-4 space-y-3">
          <div className="relative">
            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Телефон"
              className="w-full h-12 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="Код из SMS"
                className="w-full h-12 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <button
              onClick={handleRequestCode}
              disabled={busy}
              className="h-12 px-4 bg-blue-50 text-blue-600 text-xs font-semibold rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {codeSent ? 'Отправить снова' : 'Получить код'}
            </button>
          </div>

          {devCode && (
            <p className="text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
              Dev-режим: код <span className="font-bold tracking-widest">{devCode}</span>
            </p>
          )}
          {codeSent && !devCode && (
            <p className="text-xs text-gray-500">Код отправлен по SMS</p>
          )}
          {error && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>

        {/* Login Form */}
        {mode === 'login' && (
          <div className="px-5 py-4 space-y-4">
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Пароль"
                className="w-full h-12 pl-11 pr-11 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              onClick={handleLogin}
              disabled={busy || code.length !== 6 || !loginPassword}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-button transition-all active:scale-[0.98] disabled:opacity-50"
            >
              ВОЙТИ
            </button>
          </div>
        )}

        {/* Register Form */}
        {mode === 'register' && (
          <div className="px-5 py-4 space-y-3">
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={regLastName}
                onChange={(e) => setRegLastName(e.target.value)}
                placeholder="Фамилия"
                className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={regFirstName}
                onChange={(e) => setRegFirstName(e.target.value)}
                placeholder="Имя"
                className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="Email"
                className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Пароль (заглавная, строчная, цифра)"
                className="w-full h-11 pl-11 pr-11 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="relative">
              <Ticket size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={regReferral}
                onChange={(e) => setRegReferral(e.target.value)}
                placeholder="Реферальный код (например ROOT2026)"
                className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-start gap-2.5">
              <button
                type="button"
                onClick={() => setAgreed(!agreed)}
                className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  agreed ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                }`}
              >
                {agreed && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
              <p className="text-xs text-gray-500 leading-relaxed">
                Я принимаю{' '}
                <span className="text-blue-600 underline cursor-pointer">условия пользовательского соглашения</span>
                {' '}и{' '}
                <span className="text-blue-600 underline cursor-pointer">политику конфиденциальности</span>
              </p>
            </div>

            <button
              onClick={handleRegister}
              disabled={busy || code.length !== 6 || !regEmail || !regPassword || !regReferral || !agreed}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-button transition-all active:scale-[0.98] disabled:opacity-50"
            >
              ЗАРЕГИСТРИРОВАТЬСЯ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
