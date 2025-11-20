import type { FilterQuery } from 'mongoose';
import { isValidObjectId } from 'mongoose';
import { GameModel, type GameDocument } from '../models/game.model';
import type { z } from 'zod';
import type { createGameSchema, updateGameSchema } from '../schemas/game.schema';
import { sampleGames } from '../data/sampleGames';

export type CreateGameInput = z.infer<typeof createGameSchema>['body'];
export type UpdateGameInput = z.infer<typeof updateGameSchema>['body'];

export interface GameFilters {
  genre?: string;
  region?: string;
  safeOnly?: boolean;
  search?: string;
  sort?: string;
}

export const listGames = async (filters: GameFilters) => {
  const query: FilterQuery<GameDocument> = {};

  if (filters.genre) {
    query.genre = filters.genre;
  }

  if (filters.region) {
    query.regionOptions = filters.region;
  }

  if (typeof filters.safeOnly === 'boolean') {
    query.safeAccountAvailable = filters.safeOnly;
  }

  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  const sortOptions: any = {};
  if (filters.sort === '-createdAt') {
    sortOptions.createdAt = -1;
  } else if (filters.sort === 'createdAt') {
    sortOptions.createdAt = 1;
  }

  return GameModel.find(query).sort(sortOptions);
};

export const createGame = async (payload: CreateGameInput) => {
  return GameModel.create(payload);
};

const gameIdentifierFilter = (idOrSlug: string): FilterQuery<GameDocument> => {
  if (isValidObjectId(idOrSlug)) {
    return { _id: idOrSlug };
  }
  return { slug: idOrSlug };
};

export const getGameById = async (idOrSlug: string) => {
  return GameModel.findOne(gameIdentifierFilter(idOrSlug));
};

export const updateGame = async (idOrSlug: string, payload: UpdateGameInput) => {
  return GameModel.findOneAndUpdate(gameIdentifierFilter(idOrSlug), payload, { new: true });
};

export const deleteGame = async (idOrSlug: string) => {
  return GameModel.findOneAndDelete(gameIdentifierFilter(idOrSlug));
};

export const seedSampleGames = async () => {
  const slugs = sampleGames.map((game) => game.slug);
  const existing = await GameModel.find({ slug: { $in: slugs } }).select('slug');
  const existingSlugs = new Set(existing.map((game) => game.slug));

  const freshGames = sampleGames.filter((game) => !existingSlugs.has(game.slug));

  if (freshGames.length) {
    await GameModel.insertMany(freshGames);
  }

  return {
    inserted: freshGames.length,
    skipped: sampleGames.length - freshGames.length
  };
};
