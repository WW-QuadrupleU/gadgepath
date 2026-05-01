import { Metadata } from 'next';
import FreeGamesList, { FreeGame } from '@/components/FreeGamesList';

export const metadata: Metadata = {
  title: 'ゲーム無料配布情報 | ガジェパス',
  description: 'Steam、Epic Games、GOGなどで現在無料で配布されているPC・コンソールゲームのGiveaway情報をリアルタイムでお届けします。',
};

// 1時間に1回APIから再取得
export const revalidate = 3600;

async function getFreeGames(): Promise<FreeGame[]> {
  try {
    const res = await fetch('https://www.gamerpower.com/api/giveaways', {
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) {
      throw new Error(`GamerPower API responded with status ${res.status}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Failed to fetch free games:', error);
    return [];
  }
}

export default async function FreeGamesPage() {
  const games = await getFreeGames();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-brand-text mb-4 tracking-tight">
            <span className="text-[#09c071]">🎮</span> ゲーム無料配布情報
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-3 font-medium">
            Steam、Epic Gamesなどで現在無料配布されているゲームの情報をリアルタイムに取得しています。
          </p>
          <div className="inline-block bg-yellow-50 text-yellow-800 border border-yellow-200 px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
            💡 期間限定の配布も含まれるため、お早めに取得してください。
          </div>
        </div>

        <FreeGamesList initialGames={games} />
      </div>
    </div>
  );
}
