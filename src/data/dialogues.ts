import { storyDialogues } from './dialogues/story';
import { commonDialogues } from './dialogues/common';
import { Dialogue } from '../types/dialogue';

export const dialogues: Dialogue[] = [
  ...storyDialogues,
  ...commonDialogues
];
