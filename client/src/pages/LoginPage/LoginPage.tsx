import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import styles from './LoginPage.module.scss';

const AUTH_KEY = 'auth_token';

export const LoginPage: React.FC = () => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = token.trim();
    if (!trimmed) {
      setError('Please enter your access token.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: trimmed }),
      });

      if (res.ok) {
        localStorage.setItem(AUTH_KEY, trimmed);
        navigate('/dashboard', { replace: true });
      } else {
        setError('Invalid token. Please try again.');
      }
    } catch {
      setError('Unable to connect to the server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon} aria-hidden="true">🍅</span>
          <h1 className={styles.title}>Pomodoro Manager</h1>
          <p className={styles.subtitle}>Enter your access token to continue</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="token" className={styles.label}>
              Access Token
            </label>
            <input
              id="token"
              type="text"
              className={styles.input}
              placeholder="Enter your token"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                if (error) setError('');
              }}
              autoComplete="off"
              autoFocus
              aria-describedby={error ? 'token-error' : undefined}
              aria-invalid={!!error}
              disabled={loading}
            />
            {error && (
              <span id="token-error" className={styles.error} role="alert">
                {error}
              </span>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
