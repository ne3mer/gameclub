import { defaultHomeContent } from '../data/homeDefaults';
import { HomeContentModel, type HomeContentDocument } from '../models/homeContent.model';

export const getOrCreateHomeContent = async () => {
  let content = await HomeContentModel.findOne();
  if (!content) {
    content = await HomeContentModel.create(defaultHomeContent);
  }
  return content;
};

export interface HomeContentUpdatePayload {
  hero?: HomeContentDocument['hero'];
  spotlights?: HomeContentDocument['spotlights'];
  trustSignals?: HomeContentDocument['trustSignals'];
  testimonials?: HomeContentDocument['testimonials'];
}

export const updateHomeContent = async (payload: HomeContentUpdatePayload) => {
  let content = await HomeContentModel.findOne();
  if (!content) {
    content = new HomeContentModel(defaultHomeContent);
  }

  if (payload.hero) {
    content.hero = payload.hero;
  }
  if (payload.spotlights) {
    content.spotlights = payload.spotlights;
  }
  if (payload.trustSignals) {
    content.trustSignals = payload.trustSignals;
  }
  if (payload.testimonials) {
    content.testimonials = payload.testimonials;
  }

  await content.save();
  return content;
};
