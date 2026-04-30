import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins, Trophy, Clock, Users, Play, Plus, AlertTriangle, Gamepad2 } from 'lucide-react';
import { toast } from 'sonner';
import type { CoinGame } from '../../types/community.ts';
import { useAuth } from '../../context/AuthContext.tsx';

export const CoinGames = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCreateGame, setShowCreateGame] = useState(false);
  const [selectedGame, setSelectedGame] = useState<CoinGame | null>(null);
  // Track pending timeouts for cleanup
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  const currentUser = {
    id: user?.id || 'user1',
    name: user?.name || 'Người dùng',
    coins: 150000,
  };

  const [games, setGames] = useState<CoinGame[]>([
    {
      id: '1',
      gameType: 'coin_flip',
      hostId: 'user2',
      hostName: 'Trần Thị B',
      parkingLotCode: 'PL001',
      betAmount: 10000,
      participants: [
        {
          userId: 'user2',
          userName: 'Trần Thị B',
          betAmount: 10000,
          joinedAt: new Date('2026-03-31T10:00:00'),
        },
      ],
      maxParticipants: 2,
      status: 'waiting',
      createdAt: new Date('2026-03-31T10:00:00'),
    },
    {
      id: '2',
      gameType: 'dice_roll',
      hostId: 'user3',
      hostName: 'Lê Văn C',
      parkingLotCode: 'PL001',
      betAmount: 20000,
      participants: [
        {
          userId: 'user3',
          userName: 'Lê Văn C',
          betAmount: 20000,
          joinedAt: new Date('2026-03-31T09:30:00'),
        },
        {
          userId: 'user4',
          userName: 'Phạm Thị D',
          betAmount: 20000,
          joinedAt: new Date('2026-03-31T09:35:00'),
        },
      ],
      maxParticipants: 4,
      status: 'waiting',
      createdAt: new Date('2026-03-31T09:30:00'),
    },
    {
      id: '3',
      gameType: 'lucky_number',
      hostId: 'user5',
      hostName: 'Nguyễn Văn E',
      parkingLotCode: 'PL001',
      betAmount: 50000,
      participants: [
        {
          userId: 'user5',
          userName: 'Nguyễn Văn E',
          betAmount: 50000,
          joinedAt: new Date('2026-03-31T08:00:00'),
        },
        {
          userId: 'user6',
          userName: 'Trần Văn F',
          betAmount: 50000,
          joinedAt: new Date('2026-03-31T08:15:00'),
        },
      ],
      maxParticipants: 2,
      status: 'completed',
      winnerId: 'user5',
      winnerName: 'Nguyễn Văn E',
      createdAt: new Date('2026-03-31T08:00:00'),
      completedAt: new Date('2026-03-31T08:20:00'),
    },
  ]);

  const [newGame, setNewGame] = useState({
    gameType: 'coin_flip' as CoinGame['gameType'],
    betAmount: 10000,
    maxParticipants: 2,
  });

  // Cleanup timeouts on component unmount
  useEffect(() => {
    return () => {
      if (timeoutRefs.current) {
        timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      }
    };
  }, []);

  const gameTypes = [
    {
      type: 'coin_flip' as const,
      name: 'Tung xu',
      description: '2 người - Người chọn đúng mặt xu sẽ thắng',
      icon: '🪙',
      maxPlayers: 2,
    },
    {
      type: 'dice_roll' as const,
      name: 'Xúc xắc',
      description: '2-4 người - Người có số điểm cao nhất thắng',
      icon: '🎲',
      maxPlayers: 4,
    },
    {
      type: 'lucky_number' as const,
      name: 'Số may mắn',
      description: '2-5 người - Chọn số từ 1-10, gần số random nhất thắng',
      icon: '🎯',
      maxPlayers: 5,
    },
  ];

  const handleCreateGame = () => {
    if (newGame.betAmount < 1000) {
      toast.error('Số xu cược tối thiểu là 1.000');
      return;
    }

    if (currentUser.coins < newGame.betAmount) {
      toast.error('Số dư xu không đủ!');
      return;
    }

    const game: CoinGame = {
      id: (games.length + 1).toString(),
      gameType: newGame.gameType,
      hostId: currentUser.id,
      hostName: currentUser.name,
      parkingLotCode: 'PL001',
      betAmount: newGame.betAmount,
      participants: [
        {
          userId: currentUser.id,
          userName: currentUser.name,
          betAmount: newGame.betAmount,
          joinedAt: new Date(),
        },
      ],
      maxParticipants: newGame.maxParticipants,
      status: 'waiting',
      createdAt: new Date(),
    };

    setGames([game, ...games]);
    setShowCreateGame(false);
    toast.success('Đã tạo trò chơi! Đang chờ người chơi tham gia...');
  };

  const handleJoinGame = (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    if (currentUser.coins < game.betAmount) {
      toast.error('Số dư xu không đủ!');
      return;
    }

    if (game.participants.some(p => p.userId === currentUser.id)) {
      toast.error('Bạn đã tham gia trò chơi này rồi!');
      return;
    }

    const updatedGames = games.map(g => {
      if (g.id === gameId) {
        const newParticipants = [
          ...g.participants,
          {
            userId: currentUser.id,
            userName: currentUser.name,
            betAmount: g.betAmount,
            joinedAt: new Date(),
          },
        ];

        return {
          ...g,
          participants: newParticipants,
          status:
            newParticipants.length >= g.maxParticipants
              ? ('in_progress' as const)
              : g.status,
          startedAt:
            newParticipants.length >= g.maxParticipants
              ? new Date()
              : undefined,
        };
      }
      return g;
    });

    setGames(updatedGames);
    toast.success('Đã tham gia trò chơi!');

    // Auto start game if full
    const updatedGame = updatedGames.find(g => g.id === gameId);
    if (updatedGame && updatedGame.participants.length >= updatedGame.maxParticipants) {
      const timeout = setTimeout(() => {
        handlePlayGame(gameId);
      }, 1000);
      if (!timeoutRefs.current) timeoutRefs.current = [];
      timeoutRefs.current.push(timeout);
    }
  };

  const handlePlayGame = (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    // Random winner
    const randomIndex = Math.floor(Math.random() * game.participants.length);
    const winner = game.participants[randomIndex];

    const updatedGames = games.map(g => {
      if (g.id === gameId) {
        return {
          ...g,
          status: 'completed' as const,
          winnerId: winner.userId,
          winnerName: winner.userName,
          completedAt: new Date(),
        };
      }
      return g;
    });

    setGames(updatedGames);

    if (winner.userId === currentUser.id) {
      toast.success(
        `🎉 Chúc mừng! Bạn đã thắng ${(game.betAmount * game.participants.length).toLocaleString()} xu!`,
        { duration: 5000 }
      );
    } else {
      toast.error(`Bạn đã thua! ${winner.userName} là người chiến thắng.`, {
        duration: 5000,
      });
    }
  };

  const waitingGames = games.filter(g => g.status === 'waiting');
  const inProgressGames = games.filter(g => g.status === 'in_progress');
  const completedGames = games.filter(g => g.status === 'completed').slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/community')}
              className="p-2 hover:bg-white/20 rounded-full transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl mb-1">Trò chơi đổi xu</h1>
              <p className="text-amber-100 text-sm">Thử vận may và giành xu ảo</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-amber-100">Số dư của bạn</p>
              <p className="text-2xl flex items-center gap-2">
                <Coins className="w-6 h-6" />
                {currentUser.coins.toLocaleString()} xu
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateGame(true)}
            className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Tạo trò chơi mới
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Warning */}
        <div className="bg-red-50 border-2 border-red-400 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-semibold mb-2">⚠️ Lưu ý quan trọng:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Trò chơi mang tính giải trí, chỉ dùng xu ảo trong hệ thống</li>
                <li>Người thắng nhận toàn bộ xu đặt cược, người thua mất hết</li>
                <li>Chơi có trách nhiệm, không đặt cược quá nhiều xu</li>
                <li>Admin có quyền hủy trò chơi nếu phát hiện gian lận</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Waiting Games */}
        <div className="mb-8">
          <h2 className="text-2xl text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-600" />
            Đang chờ người chơi ({waitingGames.length})
          </h2>
          
          {waitingGames.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <Gamepad2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có trò chơi nào đang chờ</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {waitingGames.map((game) => {
                const gameType = gameTypes.find(t => t.type === game.gameType);
                return (
                  <div
                    key={game.id}
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all"
                  >
                    <div className="text-4xl text-center mb-4">{gameType?.icon}</div>
                    <h3 className="text-xl text-gray-900 text-center mb-2">
                      {gameType?.name}
                    </h3>
                    <p className="text-sm text-gray-600 text-center mb-4">
                      {gameType?.description}
                    </p>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Chủ phòng:</span>
                        <span className="text-sm text-gray-900">{game.hostName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Cược:</span>
                        <span className="text-lg text-amber-600 flex items-center gap-1">
                          <Coins className="w-4 h-4" />
                          {game.betAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Người chơi:</span>
                        <span className="text-sm text-gray-900">
                          {game.participants.length}/{game.maxParticipants}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Tổng giải:</span>
                        <span className="text-xl text-green-600 flex items-center gap-1">
                          <Trophy className="w-5 h-5" />
                          {(game.betAmount * game.participants.length).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleJoinGame(game.id)}
                      disabled={game.participants.some(p => p.userId === currentUser.id)}
                      className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {game.participants.some(p => p.userId === currentUser.id) ? (
                        'Đã tham gia'
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          Tham gia
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Games */}
        <div>
          <h2 className="text-2xl text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            Lịch sử ({completedGames.length})
          </h2>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Trò chơi</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Người chơi</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Cược</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Người thắng</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Giải thưởng</th>
                </tr>
              </thead>
              <tbody>
                {completedGames.map((game) => {
                  const gameType = gameTypes.find(t => t.type === game.gameType);
                  return (
                    <tr key={game.id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{gameType?.icon}</span>
                          <span className="text-gray-900">{gameType?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {game.participants.length} người
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1 text-amber-600">
                          <Coins className="w-4 h-4" />
                          {game.betAmount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                            game.winnerId === currentUser.id
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {game.winnerId === currentUser.id && <Trophy className="w-4 h-4" />}
                          {game.winnerName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1 text-green-600">
                          <Trophy className="w-4 h-4" />
                          {(game.betAmount * game.participants.length).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Game Modal */}
      {showCreateGame && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-gray-900">Tạo trò chơi mới</h2>
              <button
                onClick={() => setShowCreateGame(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-700 mb-3">Chọn trò chơi</label>
                <div className="grid grid-cols-3 gap-4">
                  {gameTypes.map((type) => (
                    <button
                      key={type.type}
                      onClick={() =>
                        setNewGame({
                          ...newGame,
                          gameType: type.type,
                          maxParticipants: type.maxPlayers,
                        })
                      }
                      className={`p-6 rounded-xl border-2 transition-all ${
                        newGame.gameType === type.type
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      <div className="text-4xl mb-2">{type.icon}</div>
                      <div className="text-sm text-gray-900 mb-1">{type.name}</div>
                      <div className="text-xs text-gray-500">{type.maxPlayers} người</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Số xu cược</label>
                <input
                  type="number"
                  value={newGame.betAmount}
                  onChange={(e) =>
                    setNewGame({ ...newGame, betAmount: parseInt(e.target.value) || 0 })
                  }
                  min="1000"
                  step="1000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tối thiểu 1.000 xu • Số dư: {currentUser.coins.toLocaleString()} xu
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-2">Tóm tắt:</p>
                  <ul className="space-y-1">
                    <li>
                      • Trò chơi:{' '}
                      {gameTypes.find(t => t.type === newGame.gameType)?.name}
                    </li>
                    <li>• Số người chơi tối đa: {newGame.maxParticipants}</li>
                    <li>• Xu cược: {newGame.betAmount.toLocaleString()}</li>
                    <li>
                      • Tổng giải thưởng:{' '}
                      {(newGame.betAmount * newGame.maxParticipants).toLocaleString()} xu
                    </li>
                  </ul>
                </div>
              </div>

              <button
                onClick={handleCreateGame}
                disabled={currentUser.coins < newGame.betAmount}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tạo trò chơi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};