"use client";

import { useState, useMemo } from "react";

export interface FreeGame {
  id: number;
  title: string;
  worth: string;
  thumbnail: string;
  image: string;
  description: string;
  instructions: string;
  open_giveaway_url: string;
  published_date: string;
  type: string;
  platforms: string;
  end_date: string;
  users: number;
  status: string;
  gamerpower_url: string;
  open_giveaway: string;
}

interface FreeGamesListProps {
  initialGames: FreeGame[];
}

export default function FreeGamesList({ initialGames }: FreeGamesListProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("All");

  const platforms = useMemo(() => {
    const platformSet = new Set<string>();
    initialGames.forEach(game => {
      game.platforms.split(', ').forEach(p => platformSet.add(p));
    });
    return ["All", ...Array.from(platformSet).sort()];
  }, [initialGames]);

  const filteredGames = useMemo(() => {
    if (selectedPlatform === "All") return initialGames;
    return initialGames.filter(game => game.platforms.includes(selectedPlatform));
  }, [initialGames, selectedPlatform]);

  if (initialGames.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">現在、無料配布情報はありません。</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* フィルター */}
      <div className="mb-8 flex flex-wrap gap-2 justify-center max-w-4xl mx-auto">
        {platforms.map(platform => (
          <button
            key={platform}
            onClick={() => setSelectedPlatform(platform)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
              selectedPlatform === platform
                ? "bg-[#09c071] text-white shadow-md transform scale-105"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
            }`}
          >
            {platform}
          </button>
        ))}
      </div>

      {/* グリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGames.map(game => (
          <div key={game.id} className="bg-white rounded-xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.15)] transition-all duration-300 flex flex-col border border-gray-100 group hover:-translate-y-1">
            <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={game.thumbnail}
                alt={game.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute top-2 right-2 bg-red-500/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider shadow-sm">
                {game.worth === "N/A" ? "FREE" : <span className="line-through mr-1 opacity-80">{game.worth}</span>}
                {game.worth !== "N/A" && "FREE"}
              </div>
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-bold uppercase">
                {game.type}
              </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-[#09c071] transition-colors">
                {game.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow leading-relaxed">
                {game.description}
              </p>
              
              <div className="mt-auto">
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {game.platforms.split(', ').slice(0, 3).map(p => (
                    <span key={p} className="bg-[#09c071]/10 text-[#09c071] font-semibold text-[11px] px-2 py-1 rounded border border-[#09c071]/20">
                      {p}
                    </span>
                  ))}
                  {game.platforms.split(', ').length > 3 && (
                    <span className="bg-gray-100 text-gray-600 font-semibold text-[11px] px-2 py-1 rounded border border-gray-200">
                      +{game.platforms.split(', ').length - 3}
                    </span>
                  )}
                </div>
                <a
                  href={game.open_giveaway_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-[#09c071] hover:bg-[#07a05d] text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  無料でGETする
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredGames.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl mt-4">
          <p className="text-gray-500 text-lg">該当するゲームが見つかりませんでした。</p>
        </div>
      )}
      
      <div className="mt-12 text-center text-sm text-gray-400 font-medium">
        Powered by <a href="https://www.gamerpower.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#09c071] transition-colors underline underline-offset-2">GamerPower API</a>
      </div>
    </div>
  );
}
