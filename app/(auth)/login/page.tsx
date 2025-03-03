'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { login, type LoginActionState } from '../actions';

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [isWechatLoading, setIsWechatLoading] = useState(false);

  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    {
      status: 'idle',
    },
  );

  useEffect(() => {
    if (state.status === 'failed') {
      toast.error('Invalid credentials!');
    } else if (state.status === 'invalid_data') {
      toast.error('Failed validating your submission!');
    } else if (state.status === 'success') {
      setIsSuccessful(true);
      router.refresh();
    }
  }, [state.status, router]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get('email') as string);
    formAction(formData);
  };

  const handleWechatLogin = () => {
    setIsWechatLoading(true);
    signIn('wechat', { callbackUrl: '/' });
  };

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Sign In</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Use your email and password to sign in
          </p>
        </div>
        <div className="flex flex-col gap-6 px-4 sm:px-16">
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2 bg-[#07C160] text-white hover:bg-[#07C160]/90 hover:text-white"
            onClick={handleWechatLogin}
            disabled={isWechatLoading}
          >
            {isWechatLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-background"></div>
                <span>处理中...</span>
              </div>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.295.295a.328.328 0 0 0 .186-.059l2.114-1.225a.866.866 0 0 1 .276-.089.788.788 0 0 1 .276.046 9.452 9.452 0 0 0 2.772.414c.488 0 .965-.035 1.429-.103a5.669 5.669 0 0 1-.143-1.257c0-3.857 3.69-6.976 8.244-6.976.27 0 .538.012.802.036C18.116 4.895 13.75 2.188 8.691 2.188zm-1.5 3.714c.63 0 1.142.512 1.142 1.143 0 .63-.512 1.142-1.142 1.142-.631 0-1.143-.512-1.143-1.142 0-.631.512-1.143 1.143-1.143zm4.462 0c.63 0 1.142.512 1.142 1.143 0 .63-.512 1.142-1.142 1.142-.631 0-1.143-.512-1.143-1.142 0-.631.512-1.143 1.143-1.143zM24 14.192c0-3.36-3.358-6.089-7.488-6.089-4.13 0-7.488 2.73-7.488 6.089 0 3.359 3.358 6.089 7.488 6.089.867 0 1.699-.128 2.468-.368a.64.64 0 0 1 .198-.035.62.62 0 0 1 .198.058l1.935 1.12a.286.286 0 0 0 .15.047c.13 0 .234-.106.234-.237 0-.059-.023-.118-.046-.175l-.326-1.224a.532.532 0 0 1 .175-.542C22.946 17.839 24 16.137 24 14.192zm-9.825-1.143c-.512 0-.93-.418-.93-.93 0-.513.418-.93.93-.93.513 0 .93.417.93.93 0 .512-.417.93-.93.93zm4.674 0c-.512 0-.93-.418-.93-.93 0-.513.418-.93.93-.93.513 0 .93.417.93.93 0 .512-.417.93-.93.93z" />
                </svg>
                <span>使用微信登录</span>
              </>
            )}
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                或者使用邮箱登录
              </span>
            </div>
          </div>
        </div>
        <AuthForm action={handleSubmit} defaultEmail={email}>
          <SubmitButton isSuccessful={isSuccessful}>Sign in</SubmitButton>
          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            {"Don't have an account? "}
            <Link
              href="/register"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              Sign up
            </Link>
            {' for free.'}
          </p>
        </AuthForm>
      </div>
    </div>
  );
}
