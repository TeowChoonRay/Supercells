import { Link } from 'react-router-dom';
import { Zap, Brain, Target, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-zinc-200">
      {/* Hero Section */}
      <div className="relative isolate px-6 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-yellow-500 to-purple-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        <div className="mx-auto max-w-4xl py-24 sm:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-3 rounded-full bg-zinc-900 ring-1 ring-zinc-800">
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-yellow-500 to-purple-500 text-transparent bg-clip-text">
              SUPERCELLS
            </h1>
            <p className="mt-4 text-lg leading-8 text-zinc-600">
              Capture · Nurture · Convert · Revolutionise
            </p>
            <p className="mt-4 text-lg leading-8 text-zinc-400">
              Transform and Manage your leads with our friendly state-of-the-art AI-powered avatars. 
            </p>
            <div className="mt-6 flex items-center justify-center gap-x-6">
              <Link to="/login">
                <Button className="bg-zinc-800 text-zinc-200 hover:bg-zinc-700 text-lg px-8 py-6">
                  Login
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              From Start to Finish
            </h2>
            <p className="mt-6 text-lg leading-8 text-zinc-400">
              Our Comprehensive Line of Avatars Helps to Streamline Leads Processing
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="relative flex flex-col gap-6 sm:flex-row lg:flex-col h-full">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-purple-500 shrink-0">
                  <Brain className="h-6 w-6" />
                </div>
                <div className="sm:min-w-0 sm:flex-1">
                  <p className="text-lg font-semibold leading-8 text-zinc-200">Visionary Insights</p>
                  <p className="mt-2 text-base leading-7 text-zinc-400">
                    Get intelligent insights to optimize your lead conversion strategies.
                  </p>
                </div>
              </div>

              <div className="relative flex flex-col gap-6 sm:flex-row lg:flex-col h-full">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-emerald-500 shrink-0">
                  <Users className="h-6 w-6" />
                </div>
                <div className="sm:min-w-0 sm:flex-1">
                  <p className="text-lg font-semibold leading-8 text-zinc-200">CRM Integration</p>
                  <p className="mt-2 text-base leading-7 text-zinc-400">
                    Work seamlessly with your team to manage and convert leads effectively.
                  </p>
                </div>
              </div>

              <div className="relative flex flex-col gap-6 sm:flex-row lg:flex-col h-full">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-blue-500 shrink-0">
                  <Target className="h-6 w-6" />
                </div>
                <div className="sm:min-w-0 sm:flex-1">
                  <p className="text-lg font-semibold leading-8 text-zinc-200">Strategic Tracking</p>
                  <p className="mt-2 text-base leading-7 text-zinc-400">
                    Track and manage your leads through every stage of the sales pipeline.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}