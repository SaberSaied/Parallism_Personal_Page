import { queryOptions } from "@tanstack/react-query";
import {
  getParliamentInfo,
  getStatistics,
  getTimeline,
  getTestimonials,
  getAchievements,
  getInitiatives,
  getGallery,
} from "./content.functions";

export const parliamentInfoQuery = queryOptions({
  queryKey: ["parliament_info"],
  queryFn: () => getParliamentInfo(),
});
export const statisticsQuery = queryOptions({
  queryKey: ["statistics"],
  queryFn: () => getStatistics(),
});
export const timelineQuery = queryOptions({
  queryKey: ["timeline"],
  queryFn: () => getTimeline(),
});
export const testimonialsQuery = queryOptions({
  queryKey: ["testimonials"],
  queryFn: () => getTestimonials(),
});
export const achievementsQuery = queryOptions({
  queryKey: ["achievements"],
  queryFn: () => getAchievements(),
});
export const initiativesQuery = queryOptions({
  queryKey: ["initiatives"],
  queryFn: () => getInitiatives(),
});
export const galleryQuery = queryOptions({
  queryKey: ["gallery"],
  queryFn: () => getGallery(),
});
