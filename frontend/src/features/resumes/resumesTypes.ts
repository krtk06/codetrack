export interface Resume {
  id: string;
  label: string;
  url: string;
  cloudinaryPublicId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeStats {
  applications: number;
  interviews: number;
  offers: number;
  rejections: number;
  pending: number;
}
