export interface WPPost {
  title: string;
  slug: string;
  content: string;
  status: string;
  date: string;
  category?: string;
  tags?: string;
  featured_image?: string;
  meta?: Record<string, any>;
}