import React, { useState } from 'react';
import { GameItem } from '../types';
import { Gamepad2, Plus, Trash2, Edit3, Search } from 'lucide-react';

interface GamesManagerProps {
  games: GameItem[];
  onChange: (updated: GameItem[]) => void;
}

const DEFAULT_ICON_URL = '/src/assets/images/game_icon_badge_1795339301121.jpg';
const DEFAULT_BG_URL = '/src/assets/images/arena_battlefield_bg_1795339301167.jpg';

const ResilientThumb: React.FC<{ src: string; alt: string; className?: string }> = ({
  src,
  alt,
  className = 'w-12 h-12 rounded-lg'
}) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`${className} bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 shrink-0`}
        title={alt}
      >
        <Gamepad2 className="w-5 h-5 text-red-500/80" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${className} object-cover border border-zinc-800 bg-zinc-950 shrink-0`}
    />
  );
};

export const GamesManager: React.FC<GamesManagerProps> = ({ games, onChange }) => {
  const [editingGame, setEditingGame] = useState<GameItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileFilter, setProfileFilter] = useState<'ALL' | GameItem['recommendedProfile']>('ALL');

  const handleSaveGame = (game: GameItem) => {
    const exists = games.some((g) => g.id === game.id);
    if (exists) {
      onChange(games.map((g) => (g.id === game.id ? game : g)));
    } else {
      onChange([...games, game]);
    }
    setIsModalOpen(false);
    setEditingGame(null);
  };

  const handleDelete = (id: string) => {
    onChange(games.filter((g) => g.id !== id));
  };

  const handleAddNew = () => {
    setEditingGame({
      id: `game-${Date.now()}`,
      packageName: 'com.example.game',
      name: 'New Game Profile',
      iconUrl: DEFAULT_ICON_URL,
      backgroundUrl: DEFAULT_BG_URL,
      recommendedProfile: 'BALANCED',
      compatibility: 'WORKS',
      notes: 'Balanced performance & thermal profile'
    });
    setIsModalOpen(true);
  };

  const filteredGames = games.filter((g) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      g.name.toLowerCase().includes(q) ||
      g.packageName.toLowerCase().includes(q) ||
      g.notes.toLowerCase().includes(q);
    const matchesProfile = profileFilter === 'ALL' || g.recommendedProfile === profileFilter;
    return matchesSearch && matchesProfile;
  });

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
            <Gamepad2 className="w-5 h-5 text-red-500" />
            <span>Games Catalog & Profiles</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Manage supported game packages, recommended profiles, compatibility status, and local artwork.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors self-start whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add Game</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-[#111115] border border-zinc-800/90 p-4 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Filter by game title or package ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-zinc-950 border border-zinc-800 rounded-lg self-start">
          {(['ALL', 'LOW-END', 'BALANCED', 'HIGH-END'] as const).map((prof) => (
            <button
              key={prof}
              type="button"
              onClick={() => setProfileFilter(prof)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                profileFilter === prof ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {prof}
            </button>
          ))}
        </div>
      </div>

      {filteredGames.length === 0 ? (
        <div className="py-12 text-center text-xs text-zinc-500 bg-[#111115] border border-dashed border-zinc-800 rounded-xl">
          No games match your filter. Add a game entry or adjust the search query.
        </div>
      ) : (
        <div className="bg-[#111115] border border-zinc-800/90 rounded-xl divide-y divide-zinc-800/80">
          {filteredGames.map((game) => (
            <div key={game.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <ResilientThumb src={game.iconUrl} alt={game.name} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-white font-semibold text-sm truncate">{game.name}</h3>
                    <span className="text-zinc-600" aria-hidden="true">·</span>
                    <span className="text-xs text-red-400 font-medium">{game.recommendedProfile}</span>
                    <span className="text-zinc-600" aria-hidden="true">·</span>
                    <span
                      className={`text-xs font-medium ${
                        game.compatibility === 'WORKS' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {game.compatibility}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5 truncate">{game.packageName}</p>
                  <p className="text-xs text-zinc-500 mt-0.5 truncate">{game.notes}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingGame(game);
                    setIsModalOpen(true);
                  }}
                  className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
                  title="Edit game"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(game.id)}
                  className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 border border-zinc-800 transition-colors"
                  title="Delete game"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && editingGame && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111115] border border-zinc-800 rounded-xl w-full max-w-xl p-6 space-y-5 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white">
              {games.some((g) => g.id === editingGame.id) ? 'Edit Game Profile' : 'Add New Game Profile'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Game Title</label>
                <input
                  type="text"
                  value={editingGame.name}
                  onChange={(e) => setEditingGame({ ...editingGame, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Android Package Name</label>
                <input
                  type="text"
                  value={editingGame.packageName}
                  onChange={(e) => setEditingGame({ ...editingGame, packageName: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Recommended Profile</label>
                  <select
                    value={editingGame.recommendedProfile}
                    onChange={(e) =>
                      setEditingGame({
                        ...editingGame,
                        recommendedProfile: e.target.value as GameItem['recommendedProfile']
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500"
                  >
                    <option value="LOW-END">LOW-END</option>
                    <option value="BALANCED">BALANCED</option>
                    <option value="HIGH-END">HIGH-END</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Compatibility</label>
                  <select
                    value={editingGame.compatibility}
                    onChange={(e) =>
                      setEditingGame({
                        ...editingGame,
                        compatibility: e.target.value as GameItem['compatibility']
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500"
                  >
                    <option value="WORKS">WORKS</option>
                    <option value="PARTIAL">PARTIAL</option>
                    <option value="NOT_WORKING">NOT_WORKING</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Icon Asset Path / HTTPS URL</label>
                <input
                  type="text"
                  value={editingGame.iconUrl}
                  onChange={(e) => setEditingGame({ ...editingGame, iconUrl: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Background Artwork Path / HTTPS URL</label>
                <input
                  type="text"
                  value={editingGame.backgroundUrl}
                  onChange={(e) => setEditingGame({ ...editingGame, backgroundUrl: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Compatibility Notes</label>
                <input
                  type="text"
                  value={editingGame.notes}
                  onChange={(e) => setEditingGame({ ...editingGame, notes: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveGame(editingGame)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white"
              >
                Save Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamesManager;
