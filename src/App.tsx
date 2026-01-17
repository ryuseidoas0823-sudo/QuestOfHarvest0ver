import React, { useState, useEffect } from 'react';
import { Zap, Shield, Sword, Heart, Star, LayoutGrid } from 'lucide-react';

// -- Definitions moved from ../types --

export interface Perk {
  id: string;
  name: string;
  description: string;
  icon: any; // Using any to accept Lucide components loosely or strictly
  cost: number;
  category: 'offense' | 'defense' | 'utility';
}

export const PERK_DEFINITIONS: Perk[] = [
  {
    id: 'speed_boost',
    name: 'Swift Strikes',
    description: 'Increases attack speed by 15%',
    icon: Zap,
    cost: 100,
    category: 'offense'
  },
  {
    id: 'iron_skin',
    name: 'Iron Skin',
    description: 'Reduces incoming damage by 10%',
    icon: Shield,
    cost: 150,
    category: 'defense'
  },
  {
    id: 'power_surge',
    name: 'Power Surge',
    description: 'Boosts base damage by 20%',
    icon: Sword,
    cost: 200,
    category: 'offense'
  },
  {
    id: 'vitality',
    name: 'Vitality',
    description: 'Increases max health by 50',
    icon: Heart,
    cost: 120,
    category: 'defense'
  },
  {
    id: 'resourcefulness',
    name: 'Resourcefulness',
    description: 'Cooldowns reduce 10% faster',
    icon: Star,
    cost: 180,
    category: 'utility'
  }
];

// ... existing code ...
