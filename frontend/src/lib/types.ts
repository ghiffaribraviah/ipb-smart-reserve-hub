export type UserRole = "student" | "staff" | "super_admin";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface FacilityCatalogItem {
  id: string;
  name: string;
  location: string;
  capacity: number;
  category: string;
  cover_image_url: string | null;
  rating_average: number | null;
  review_count: number;
  price_summary: string;
  open_hours_summary: string;
}

export interface FacilityContact {
  name: string;
  phone: string;
  email: string | null;
}

export interface FacilityImage {
  url: string;
  alt_text: string;
  is_cover: boolean;
}

export interface FacilityPrice {
  is_free: boolean;
  amount_rupiah: number;
  summary: string;
}

export interface FacilityReviewSummary {
  rating_average: number | null;
  review_count: number;
}

export interface FacilityPublicReview {
  id: string;
  rating: number;
  comment: string | null;
  author_name: string;
  created_at: string;
}

export interface FacilityDetail {
  id: string;
  name: string;
  location: string;
  capacity: number;
  category: string;
  description: string;
  contact: FacilityContact;
  images: FacilityImage[];
  price: FacilityPrice;
  open_hours_summary: string;
  review_summary: FacilityReviewSummary;
  reviews: FacilityPublicReview[];
}

export interface OrganizationUnit {
  id: string;
  name: string;
  type: string;
  code: string;
  is_active: boolean;
}
