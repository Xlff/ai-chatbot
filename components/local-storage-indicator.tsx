'use client';

import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export function LocalStorageIndicator() {
  const [storageSize, setStorageSize] = useState<string>('0 KB');
  
  useEffect(() => {
    const calculateStorageSize = () => {
      try {
        const data = localStorage.getItem('ai-chatbot-db');
        if (data) {
          const bytes = new Blob([data]).size;
          let size = '0 KB';
          
          if (bytes < 1024) {
            size = `${bytes} B`;
          } else if (bytes < 1024 * 1024) {
            size = `${(bytes / 1024).toFixed(1)} KB`;
          } else {
            size = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
          }
          
          setStorageSize(size);
        }
      } catch (error) {
        console.error('Failed to calculate storage size:', error);
      }
    };
    
    calculateStorageSize();
    
    // 添加存储事件监听器
    const handleStorageChange = () => {
      calculateStorageSize();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // 定期更新存储大小
    const interval = setInterval(calculateStorageSize, 5000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="ml-2 cursor-help">
            本地存储 ({storageSize})
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>数据保存在浏览器本地存储中</p>
          <p>不会发送到服务器</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 