export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "technical" | "collectibles" | "apparel";
  badge?: string;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  variant?: string;
}

export const products: Product[] = [
  {
    id: "zenith-shell-v1",
    name: "ZENITH SHELL V.1",
    description:
      "Waterproof modular jacket with haptic feedback sensors",
    price: 450,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA-owEgYSUyB5U6ZetwXCIhOBOl_r_Yj-gcOfHsD_LDZ6m5mtH5f9tCYRkfI261ur-i4t0ft6VOpYZmHDeZi5xLPVWEvdA8XgKkuwb78BbYdW49ee10zO7z4Ln8vQzQl_GF5ds-qFGEyl3EWV69yGOrcUqTI7xYW_c1G5gkCkRw58LZyr0VNSRkin3Yhwjb3z9VAg1a3_G6wQS4XNtqWVnWk-YxYtseOdP8lUS1eHRCTkH7ZPt_E1TclAFVDUZFy4PVhnrXx468Mqya",
    category: "technical",
    featured: true,
  },
  {
    id: "chronos-ti-link",
    name: "CHRONOS TI-LINK",
    description: "Precision machined titanium wearable",
    price: 1200,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA096japkNbE_WrQw7qZKSRGJxcbpWZbrNtIUgvIS2Mk5hdr_YMJQaiZRmAFwVlxjelh6YqF-Jfx2zQxG7I8iONNNkYY1A9l2mkj9lxhjyc2eZ0Qee6vW3O6DypVDdlf55JglWbkf59U41XnBwlNF0Np8Ocfmhk-4rfQvp2dwSfnLn7FgsO--Cz5SdYLOO2FVp6Dds8w6S24ADSOJNlS50ZniUIzLGZ-hOF9Q59RnFhfEbp9MlgCsdY8lyCGmZeBTAbel0d416iAqSn",
    category: "collectibles",
    badge: "LIMITED",
  },
  {
    id: "velocity-01-shoe",
    name: "VELOCITY 01 SHOE",
    description: "Driving performance shoe",
    price: 280,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAQOkzVDNVKY0Xk75bNcP8AnJzQCemzug1W009FOhwZcN_Po73mCi9MdCpBW28pliY8LRY-GB8XA0KtyTwqr53NUqppY4_QbHB8GwKHLYgCTjyFPjuw-pti9jbCMdHzZTtgFh61wqp_vql__uYLI_ch9OUBeh1GFQ1yCBgSrOkOUeAX89Poo2xIWi4y4kZssvk7g2_2sj4f_EKzoJ9fNDBFt4-Ea3DHztLuM339sPOIdENVq_3Wlle3ppBmTPraHAeKpbphiYO1ye5t",
    category: "technical",
  },
  {
    id: "zenith-diecast-1-18",
    name: "1:18 ZENITH DIECAST",
    description: "Hand-assembled precision scale model",
    price: 550,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAfhyEgIpl4agh54uBmAeAhZgMIbTHJX0xbgxgw25g6wNgXxqBg1kTsPMcVry3-b-NvVdVrWyRTYGwombqimwG70jfEULCVNuPCXBRnNdUC9reIcumHX49OBz5s9EP_rPcmM5HR8cQ4bmL6JypDBPJD12Iim8MG_mpjfIauoleloZuQBvXjMh1Kde4ctv6L79U9xU3CssvQuZfeFjk5t0lQ__K4352DqnP35immT059YztKMBZTfRxqobZEfqjeFjAq8CGxul3_cVRX",
    category: "collectibles",
  },
  {
    id: "schematic-tee",
    name: "SCHEMATIC TEE",
    description: "100% organic heavy-weight cotton",
    price: 85,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBfIp3VgYLLAYhJXUPUBebPEbj_z-CxPNczhdr_ElBWe8KU93gBhp1IpWajNtVY7lbaY0sgr8QeT9y9gBAxByAoiwKSZrNq-3iwB1jY_SzZQPSNjUp1uu1v3yNxzaA0HfgA61zXTjbGjUg8vRJzVGVwEypssOi1s9pFeqOGlQPJpAE64HSFlcJTmc0YJb9LebXURSSy6IiFQnbDQv-O68gis-u62DRzHj5GXVyRKjK0iSpZ_pBCplFsuAFgDWSIHHt-nNb2KNIQ09pK",
    category: "apparel",
  },
];

export const categories: string[] = [
  "New Arrivals",
  "Collectibles",
  "Technical",
];

export const mockCartItems: CartItem[] = [
  {
    product: products[2],
    quantity: 1,
    size: "42",
    variant: "Black/Electric",
  },
];
