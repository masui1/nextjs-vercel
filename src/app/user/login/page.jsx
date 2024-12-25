'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Typography, Box, Button, TextField } from '@mui/material';

const UserLogin = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
  
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log(username, password);
  
      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(`ログインに失敗しました: ${errorData.error || '不明エラー'}`);
        return;
      }
  
      router.push('/user/top');
    } catch {
      setErrorMessage('ネットワークエラーが発生しました。');
    }
  };
  

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        ログイン
      </Typography>
      <form
        onSubmit={handleLogin}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}
      >
        <TextField
          label="ユーザー名"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          autoComplete="username"
        />
        <TextField
          label="パスワード"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          autoComplete="current-password"
        />
        <Button type="submit" variant="contained" color="primary">
          ログイン
        </Button>
      </form>
      {errorMessage && (
        <Typography color="error" variant="body1" sx={{ mt: 2 }}>
          {errorMessage}
        </Typography>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" sx={{ marginTop: 2 }}>
                <>
                    アカウントが無い方はこちらで{' '}
                    <Link href='/user' passHref>
                        <Button variant="outlined" fullWidth>
                            新規登録
                        </Button>
                    </Link>
                    お願いします。
                </>
        </Typography>
    </Box>
    </Box>
  );
};

export default UserLogin;
