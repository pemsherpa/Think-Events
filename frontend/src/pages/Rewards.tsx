import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Award, Gift, Star, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Layout/Header';

const Rewards = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* Header Section */}
          <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent bg-300% animate-gradient">
              Your Rewards
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-xl max-w-2xl mx-auto">
              Unlock exclusive perks and experiences. Earn 1 point for every 100 NPR you spend on tickets.
            </p>
          </div>

          {/* Points Card */}
          <div className="relative group animate-in zoom-in-95 duration-700 delay-100">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <Card className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none shadow-2xl overflow-hidden rounded-2xl">
              <div className="absolute top-0 right-0 p-12 opacity-5 transform translate-x-1/4 -translate-y-1/4">
                <Award className="w-96 h-96" />
              </div>
              <CardContent className="p-8 md:p-12 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="space-y-2 text-center md:text-left">
                    <p className="text-purple-300 font-medium text-lg uppercase tracking-wider">Available Balance</p>
                    <div className="flex items-baseline gap-3 justify-center md:justify-start">
                      <span className="text-7xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
                        {user?.reward_points || 0}
                      </span>
                      <span className="text-2xl text-purple-300 font-bold">PTS</span>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex items-center gap-6 hover:bg-white/15 transition-colors cursor-default">
                    <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-4 rounded-full shadow-lg shadow-yellow-500/20">
                      <Star className="w-8 h-8 text-white fill-white" />
                    </div>
                    <div>
                      <p className="font-bold text-xl text-white">Gold Member</p>
                      <p className="text-sm text-purple-200">Earn 1 pt per 100 NPR</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Grid */}
          <div className="grid md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-8 duration-700 delay-200">
            {/* Redeem Section */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <Gift className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="dark:text-white">Redeem Points</span>
                </CardTitle>
                <CardDescription className="text-base">Exchange your points for exclusive rewards</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-purple-500/10 animate-pulse"></div>
                  <TrendingUp className="w-12 h-12 text-gray-400 dark:text-gray-500 relative z-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white">Coming Soon</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
                    We're crafting an amazing rewards catalog. Expect ticket discounts, exclusive merchandise, and VIP experiences!
                  </p>
                </div>
                <Button disabled variant="outline" className="mt-4 border-dashed">
                  Catalog Updating...
                </Button>
              </CardContent>
            </Card>

            {/* How it Works */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Star className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="dark:text-white">How it Works</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 pt-4">
                {[
                  { step: 1, title: "Book Tickets", desc: "Purchase tickets for any event on our platform." },
                  { step: 2, title: "Earn Points", desc: "Get 1 point for every 100 NPR spent automatically." },
                  { step: 3, title: "Redeem", desc: "Use points for discounts on future bookings." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500 dark:text-gray-400 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 z-10 relative">
                        {item.step}
                      </div>
                      {i !== 2 && (
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-gray-200 dark:bg-gray-700 group-hover:bg-purple-200 dark:group-hover:bg-purple-900 transition-colors duration-300 delay-100"></div>
                      )}
                    </div>
                    <div className="pt-1">
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{item.title}</h4>
                      <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Rewards;
