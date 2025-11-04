export interface Painting {
  _id: string;
  title: string;
  description: string;
  dimensions: {
    width: number;
    height: number;
    unit: 'inches' | 'cm';
  };
  medium: string;
  price: number;
  category: string;
  images: {
    thumbnail: string;
    fullSize: string[];
  };
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaintingFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}