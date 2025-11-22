'use client';

import { useState, useEffect } from 'react';
import { BracketNode, Match } from '@/types/tournament';
import { Icon } from '@/components/icons/Icon';
import { API_BASE_URL } from '@/lib/api';

interface BracketViewerProps {
  bracket: BracketNode | null;
  tournamentId: string;
}

export default function BracketViewer({ bracket, tournamentId }: BracketViewerProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);

  // If bracket is null, maybe we can try to fetch it or check if it can be generated
  // For now assuming it's passed
  
  if (!bracket) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Icon name="layers" size={48} className="mb-4 opacity-50" />
        <p className="text-lg font-medium">براکت هنوز ایجاد نشده است</p>
        <p className="text-sm">پس از تکمیل ظرفیت، براکت مسابقات نمایش داده می‌شود</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-8 pt-4 custom-scrollbar">
      <div className="min-w-[800px] flex justify-center">
        <BracketNodeComponent node={bracket} isRoot={true} />
      </div>
    </div>
  );
}

function BracketNodeComponent({ node, isRoot = false }: { node: BracketNode; isRoot?: boolean }) {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Match Card */}
      <div className={`
        relative z-10 w-64 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-105
        ${isRoot ? 'border-yellow-500/50 shadow-yellow-500/10' : ''}
      `}>
        {/* Header */}
        <div className="bg-slate-800/50 px-3 py-1.5 flex justify-between items-center border-b border-slate-700/50">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
            {node.roundName}
          </span>
          {node.matchId && (
            <span className="text-[10px] text-slate-500">
              #{node.matchId.slice(-4)}
            </span>
          )}
        </div>

        {/* Players */}
        <div className="p-2 space-y-1">
          <PlayerRow player={node.player1} isWinner={node.winner && node.player1 && (node.winner as any)._id === (node.player1 as any)._id} />
          <div className="h-px bg-slate-800" />
          <PlayerRow player={node.player2} isWinner={node.winner && node.player2 && (node.winner as any)._id === (node.player2 as any)._id} />
        </div>
      </div>

      {/* Connector Lines */}
      {hasChildren && (
        <div className="flex flex-col items-center">
          {/* Vertical Line from bottom of current node */}
          <div className="h-8 w-px bg-slate-600"></div>
          
          {/* Horizontal Bar connecting children */}
          <div className="flex w-full justify-center relative">
             {/* We need to span across children. 
                 This simple flex approach works for balanced trees. 
                 For precise lines, SVG is better, but CSS flex/grid can work for binary trees.
             */}
             
             {/* 
                Structure:
                Parent
                  |
                --+--
                |   |
               C1   C2
             */}
             
             <div className="absolute top-0 left-1/4 right-1/4 h-px bg-slate-600"></div>
          </div>

          {/* Children Container */}
          <div className="flex gap-8 pt-0">
            {node.children!.map((child, index) => (
              <div key={child.id || index} className="flex flex-col items-center relative">
                <div className="h-8 w-px bg-slate-600"></div>
                <BracketNodeComponent node={child} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlayerRow({ player, isWinner }: { player?: any; isWinner?: boolean }) {
  if (!player) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 opacity-50">
        <div className="w-6 h-6 rounded-full bg-slate-800" />
        <span className="text-sm text-slate-500">TBD</span>
      </div>
    );
  }

  const isBye = player.name === 'Bye';

  return (
    <div className={`
      flex items-center justify-between px-2 py-1 rounded
      ${isWinner ? 'bg-gradient-to-r from-yellow-500/10 to-transparent' : ''}
    `}>
      <div className="flex items-center gap-2 overflow-hidden">
        {player.avatar ? (
          <img src={player.avatar} alt={player.name} className="w-6 h-6 rounded-full object-cover" />
        ) : (
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
            ${isBye ? 'bg-slate-800 text-slate-500' : 'bg-purple-500 text-white'}
          `}>
            {isBye ? '-' : player.name?.charAt(0).toUpperCase()}
          </div>
        )}
        <span className={`text-sm truncate max-w-[100px] ${isWinner ? 'text-yellow-400 font-bold' : 'text-slate-300'}`}>
          {player.name || player.gameTag?.psn || 'Unknown'}
        </span>
      </div>
      {isWinner && <Icon name="check" size={14} className="text-yellow-500" />}
    </div>
  );
}
