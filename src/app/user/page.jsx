'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Box, Button, TextField } from '@mui/material';

const User = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: '不明なサーバーエラーが発生しました。',
        }));
        setErrorMessage(`登録に失敗しました: ${errorData.error || '不明エラー'}`);
        return;
      }

      router.push('/top');
    } catch (error) {
      setErrorMessage('ネットワークエラーが発生しました。');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        管理者画面
      </Typography>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}
      >
        <TextField
          label="ユーザー名"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
        />
        <TextField
          label="パスワード"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />
        <Button type="submit" variant="contained" color="primary">
          登録
        </Button>
      </form>
      {errorMessage && (
        <Typography color="error" variant="body1" sx={{ mt: 2 }}>
          {errorMessage}
        </Typography>
      )}
      <Button
          variant="contained"
          color="secondary"
          sx={{ mt: 2 }}
          onClick={() => {
              router.back();
          }}
      >
          戻る
      </Button>
    </Box>
  );
};

export default User;
