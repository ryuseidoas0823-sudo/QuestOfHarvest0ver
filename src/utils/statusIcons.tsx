import React from 'react';
import { 
  Skull, 
  Flame, 
  Zap, 
  Heart, 
  Shield, 
  Sword, 
  Target, 
  Activity,
  Layers
} from 'lucide-react';
import { StatusType } from '../types/combat';

interface StatusIconProps {
  type: string; // StatusTypeですが、文字列で来ることも想定
  size?: number;
  className?: string;
}

export const StatusIcon: React.FC<StatusIconProps> = ({ type, size = 16, className = '' }) => {
  switch (type as StatusType) {
    case 'poison':
      return <Skull size={size} className={`text-purple-500 ${className}`} />;
    case 'burn':
      return <Flame size={size} className={`text-orange-500 ${className}`} />;
    case 'stun':
      return <Zap size={size} className={`text-yellow-400 ${className}`} />;
    case 'regen':
      return <Heart size={size} className={`text-pink-400 ${className}`} />;
    case 'buff': // 汎用バフ
      return <Activity size={size} className={`text-blue-400 ${className}`} />;
    case 'berserk':
      return <Sword size={size} className={`text-red-600 ${className}`} />;
    case 'guardian':
      return <Shield size={size} className={`text-blue-500 ${className}`} />;
    case 'killing_zone':
      return <Target size={size} className={`text-red-400 ${className}`} />;
    case 'barrier':
      return <Layers size={size} className={`text-cyan-400 ${className}`} />;
    default:
      return <Activity size={size} className={`text-gray-400 ${className}`} />;
  }
};

export const getStatusColor = (type: string): string => {
  switch (type as StatusType) {
    case 'poison': return 'bg-purple-900/80 border-purple-500';
    case 'burn': return 'bg-orange-900/80 border-orange-500';
    case 'stun': return 'bg-yellow-900/80 border-yellow-500';
    case 'regen': return 'bg-pink-900/80 border-pink-500';
    case 'berserk': return 'bg-red-900/80 border-red-500';
    case 'guardian': return 'bg-blue-900/80 border-blue-500';
    case 'killing_zone': return 'bg-slate-800/80 border-red-400';
    case 'barrier': return 'bg-cyan-900/80 border-cyan-500';
    default: return 'bg-slate-800/80 border-slate-500';
  }
};
