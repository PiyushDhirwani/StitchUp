import api from './api';

export interface SubType {
  id: number;
  sub_type_name: string;
  description: string;
  image_url: string | null;
  status: string;
  price_adjustment: number;
  final_base_price: number;
}

export interface TemplateType {
  id: number;
  type_name: string;
  description: string;
  image_url: string | null;
  category: string;
  status: string;
  base_price: number | null;
  complexity_level: string | null;
  estimated_hours: number | null;
}

export interface Template {
  template_type: TemplateType;
  sub_types: SubType[];
}

export const templateService = {
  getAll: () => api.get<{ success: boolean; data: Template[] }>('/templates'),

  getDetails: (templateId: number) =>
    api.get<{ success: boolean; data: Template }>(`/templates/${templateId}`),
};
