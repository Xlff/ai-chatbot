'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function WxAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 从 URL 参数中获取 code
  const code = searchParams.get('code');

  useEffect(() => {
    // 如果有 code 参数，说明是从微信授权页面重定向回来的
    if (code) {
      handleWechatAuth(code);
    }
  }, [code]);

  const handleWechatAuth = async (code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('wechat', {
        code,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.url) {
        router.push(result.url);
      } else {
        router.push('/');
      }
    } catch (err) {
      console.error('微信授权登录失败:', err);
      setError('微信授权登录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWechatLogin = () => {
    setIsLoading(true);
    signIn('wechat', { callbackUrl: '/' });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">微信授权登录</CardTitle>
          <CardDescription>使用微信公众号授权登录系统</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/15 p-3 text-destructive">
              <p>{error}</p>
            </div>
          )}
          {code ? (
            <div className="text-center">
              <p className="mb-4">正在处理微信授权...</p>
              {isLoading && (
                <div className="flex justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-4">点击下方按钮使用微信授权登录</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-[#07C160] hover:bg-[#07C160]/90"
            onClick={handleWechatLogin}
            disabled={isLoading || !!code}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-background"></div>
                <span>处理中...</span>
              </div>
            ) : (
              <span>微信授权登录</span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 