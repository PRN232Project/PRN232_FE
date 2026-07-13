import apiClient from '@/lib/api-client';

export interface ReviewItem {
  reviewId: string;
  courseId: string;
  userId: string;
  studentName: string;
  studentAvatar?: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CourseReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<string, number>;
  reviews: ReviewItem[];
  myReview?: ReviewItem;
}

export const reviewService = {
  async getReviews(courseId: string): Promise<CourseReviewSummary> {
    const res = await apiClient.get(`/reviews/${courseId}`);
    return res.data.result;
  },

  async submitReview(courseId: string, rating: number, comment?: string): Promise<void> {
    await apiClient.post('/reviews', { courseId, rating, comment });
  },

  async deleteReview(reviewId: string): Promise<void> {
    await apiClient.delete(`/reviews/${reviewId}`);
  }
};
