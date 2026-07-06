export interface ParliamentInfo {
  id: string;
  name: string;
  title: string;
  bio: string;
  office_address: string;
  phone: string;
  email: string;
  working_hours: string;
  social_media: Record<string, string>;
}

export interface Statistic {
  id: string;
  label: string;
  value: string;
  icon: string;
  sort_order: number;
}

export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  sort_order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  avatar: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  date: string;
  image: string;
  slug: string;
  likes: number;
  status?: string | null;
  progress?: number | null;
  link?: string | null;
}

export type InitiativeStatus = "نشط" | "مكتمل" | "مخطط له";

export interface Initiative {
  id: string;
  title: string;
  description: string;
  content: string;
  status: InitiativeStatus;
  category: string;
  date: string;
  image: string;
  slug: string;
  progress: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
  date: string;
}

export type RequestStatus =
  "submitted" | "under_review" | "assigned" | "in_progress" | "resolved" | "closed";

export interface CitizenRequestPublic {
  tracking_number: string;
  title: string;
  category: string;
  status: RequestStatus;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export interface CitizenRequest extends CitizenRequestPublic {
  id: string;
  citizen_name: string;
  citizen_civil_id: string;
  citizen_phone: string;
  citizen_email: string;
  description: string;
  assigned_to: string;
  attachments: string[];
}

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  submitted: "مُقدّمة",
  under_review: "قيد المراجعة",
  assigned: "تم الإسناد",
  in_progress: "قيد التنفيذ",
  resolved: "تم الحل",
  closed: "مغلقة",
};
