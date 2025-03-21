// src/pages/sign-in/[[...index]].tsx
import { SignIn } from "@clerk/nextjs";
import Head from "next/head";

export default function SignInPage() {
  return (
    <>
      <Head>
        <title>Sign In - SuperCells</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-purple-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black/0 to-transparent"></div>
        <div className="relative z-10">
          <SignIn appearance={{
            elements: {
              formButtonPrimary: 
                'bg-gradient-to-r from-orange-300 via-pink-500 to-purple-400 hover:from-orange-400 hover:via-pink-600 hover:to-purple-500',
              card: 'bg-gray-900/80 backdrop-blur-md',
              headerTitle: 'text-white',
              formFieldLabel: 'text-gray-300',
              formFieldInput: 'bg-gray-800 text-white border-gray-700',
              footerActionLink: 'text-purple-400 hover:text-purple-300',
            }
          }} />
        </div>
      </main>
    </>
  );
}