import { z } from "zod";

export const WatchListTypeSchema = z.enum([
  "WANT_TO_WATCH",
  "CURRENTLY_WATCHING",
  "RECENTLY_WATCHED_TV",
  "RECENTLY_WATCHED_MOVIES",
  "FAVORITE_SERIES",
  "FAVORITE_MOVIES",
]);

export const MediaTypeSchema = z.enum(["tv", "movie"]);

export const FavoriteCategorySchema = z.enum([
  "Realserie",
  "Animated",
  "Anime",
]);

export const AddMovieSchema = z.object({
  tmdbId: z.number().int().positive("Ungültige TMDb ID"),
  listType: WatchListTypeSchema,
  seasonNumber: z.string().default(""),
  title: z.string().min(1, "Titel ist erforderlich"),
  releaseDate: z.string(),
  posterPath: z.string().nullable(),
  mediaType: MediaTypeSchema,
  finishedDate: z.string().nullable().optional(),
  favoriteCategory: FavoriteCategorySchema.nullable().optional(),
  notes: z.string().max(500, "Notizen dürfen max. 500 Zeichen haben").nullable().optional(),
});

export const EditMovieSchema = AddMovieSchema.extend({
  oldListType: WatchListTypeSchema,
  oldSeasonNumber: z.string(),
  isFavorite: z.boolean().optional(),
});

export const DeleteMovieSchema = z.object({
  tmdbId: z.number().int().positive(),
  listType: WatchListTypeSchema,
  seasonNumber: z.string().default(""),
  mediaType: MediaTypeSchema,
});

export const MoveMovieSchema = z.object({
  action: z.enum(["to_watching", "to_watched"]),
  fromListType: WatchListTypeSchema.default("WANT_TO_WATCH"),
  seasonNumber: z.string().optional(),
});

export const ReorderFavoritesSchema = z.object({
  items: z.array(
    z.object({
      tmdbId: z.number().int().positive(),
      listType: WatchListTypeSchema,
      seasonNumber: z.string(),
      sortOrder: z.number().int(),
    })
  ).min(1, "Mindestens ein Element erforderlich"),
});

// TypeScript-Typen automatisch ableiten
export type WatchListType = z.infer<typeof WatchListTypeSchema>;
export type MediaType = z.infer<typeof MediaTypeSchema>;
export type FavoriteCategory = z.infer<typeof FavoriteCategorySchema>;
export type AddMovieInput = z.infer<typeof AddMovieSchema>;
export type EditMovieInput = z.infer<typeof EditMovieSchema>;
export type DeleteMovieInput = z.infer<typeof DeleteMovieSchema>;
export type MoveMovieInput = z.infer<typeof MoveMovieSchema>;
export type ReorderFavoritesInput = z.infer<typeof ReorderFavoritesSchema>;