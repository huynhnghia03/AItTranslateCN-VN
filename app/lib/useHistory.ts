'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
interface JwtPayload {
  sub: string;
  exp: number;
}
export function useHistory(type:string) {
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async (type:string) => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        console.error('No JWT found, please login');
        return;
      }
      const decoded: JwtPayload = jwtDecode(token);
      const response = await fetch(`http://localhost:8000/history?task_type=${type}&user_id=${decoded.sub}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      } else {
        console.error('Error fetching history:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const clearHistory = async (type: string) => {
    try {
      const token = Cookies.get('token');
      
      if (!token) {
        console.error('No JWT found, please login');
        return;
      }
      const decoded: JwtPayload = jwtDecode(token);
      const response = await fetch(`http://localhost:8008/history?type=${type}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setHistory([]);
      } else {
        console.error('Error clearing history:', response.statusText);
      }
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const getHistoryByType = (type: string) => {
    return history.filter((item) => item.type === type);
  };

  useEffect(() => {
    fetchHistory(type);
  }, [type]);

  return { history, getHistoryByType, clearHistory, fetchHistory };
}