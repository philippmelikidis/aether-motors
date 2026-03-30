export interface GalleryItem {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  type: "image" | "video";
  duration?: string;
  category: string;
  featured?: boolean;
  span?: "large" | "medium" | "small";
}

export const galleryItems: GalleryItem[] = [
  {
    id: "kinetic-sculpting",
    title: "Kinetic Sculpting",
    subtitle: "Series Alpha",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAQ-BUKYm6zwpWNJkprHYXoKhrTEA0TYzDwnE1fLMiKUoBAAXFu9I5qfx-GZZE2_-6LsxRk3PUH8BacR59w2GJzOl5YgfBQ38dw-VmI7VZZMmsaGzuKVC-XPQrcLz_br9QvYwd8oZy_wMe1Rv7tppNIDjQP3SSGFI4iI_VsHNkAsDBz5IVqIftHBVarUvod94oiMA7PfCK8U8boomkijr1T-M7pibt9-CfcinLIj7u4liN1Kq7CWveo7Ad_teiVcqW12Qa7D01zDCtW",
    type: "image",
    category: "Design",
    featured: true,
    span: "large",
  },
  {
    id: "the-cockpit",
    title: "The Cockpit",
    subtitle: "Biometric integration",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDaWpWE--H52gp6umrRRBKWf6NFs_aXg46S1S9qmbhK07T0CRDrkaFns7KskMdGNJbfDi0GlPhhTZuvV6ATJuVgnqIr2mSsk8xI5r6jA0B-8Am9x07UZX9KCH0c_2eiSXnTxA-ytTGLZUpZvXqETQNf-eJBnJ4yQZ0zeVcE5dgCo3vxU8FwOz-LjeXwXpyH_hBgWzMS0qHCmLhijbOl0EieRan9nkqZkh23QAsVQZJkUaEayPYNMCkaej76cj8kgm0yeCbbbj_0CkB4",
    type: "image",
    category: "Interior",
    span: "medium",
  },
  {
    id: "v12-acoustic-test",
    title: "V12 Acoustic Test",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA7I1vqMulAIdCDSc5NaTRaFJfl-r4ycMzJBpkw1U76h9g9O98f4LgxNokkgXoouIjJGe62PS_b0IhKPHf78O09_fvMijTV12gj9GSGuDDCJrhRYDoz0W2qVgaSj5N--beEyWq0NNDMM47FB4UgEGXPVeWYBLCoRwOVboRhsdGXhCxXzYJBLt6X8yMQV-JuzqQZRlcYMIMNwF0T5ZPVYC6bb347Vn8uIIZjwqacDfl4YnNArT6vMYcMWU8EUbFPjUavoVeOs_PWXckp",
    type: "video",
    duration: "04:12",
    category: "Engineering",
    span: "medium",
  },
  {
    id: "carbon-lite-alloys",
    title: "Carbon-Lite Alloys",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuALVh4mIJr9eRGRE2qByhAhQt_edw9qMLkioKwwPN75eh7VBzTz-PC_zT88YY7cmLzFlZZ8nuzSpa-1nKmN3yn5ipkKxJyJrr5d25Gk4lRDqAILZ7xqEEOYhbTYpgpet96NCRYYb96x41aacV_3Yro31BAtYUFZwz0nRC_C-jJEp1tzokm2Zu_6BCfyysRqcySUukina2iI3OUGGZvlU-Ek_NDrGEhHOrXGw-gthIatWigeqal82MCQC9lh7GpHsorNh7E5HnXmAkVG",
    type: "image",
    category: "Materials",
    span: "small",
  },
  {
    id: "the-fleet-evolution",
    title: "The Fleet Evolution",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDzL44-yawWOvPa_yYfmag8cyg-a7NovMxUh4x_Ew7gYbkfY8TtsHIaniujSSPyRmYRxp12sXTxPvmcC-h0RhnA0IsaoLOWsCc28IP6dldlZfiQ6tw7qUAxcU_7wwNbAVD1qdou9JOhS3fJ8uVZYbuPHohfFUCPnKMwJfcLg-_5dDTxEJh2zsi2CvF8_TBKFXYypV1WcFJ-gDtKGPPzWHxwlsAOrPG1vDZakmSkP7Rfvosmc--r1GtXz4fpxwelucDX9ISnoPLCx8tz",
    type: "image",
    category: "Fleet",
    span: "large",
  },
  {
    id: "zenith-manifesto",
    title: "The Zenith Manifesto",
    subtitle: "Now Premiering",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC1wP3gwLbl_Zfni0ZpJMZNohPRQuldZOYzFyB2stKhRupgTFT3bAkRk3GhF-qGI3fCfeXM77B5S3WTDk4JnDxaSb6b4GEu3L_M4k2tGTv8ayqrQk-S5JBV8nZ5pLjDbN9GBmyNwgf3awqH_kD-tx6YTpLZrGu9cGzKKxOCtMJEfYxmsILGLIt4CWnAnrLZy1mPR5CZh1w1h7d1rCf3Fcmplnah5kIEWCSVUUxe2DEvBrgE_2IZMsM2UnZ_9Ec7XGx0FPBMGAYU9T6n",
    type: "video",
    category: "Film",
    featured: true,
    span: "large",
  },
];
