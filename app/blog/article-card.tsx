'use client';

import Link from 'next/link';
import { useState } from 'react';

interface Article {
  slug: string;
  title: string;
  description: string;
  date: string;
  image: string;
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1677691711202-91bda7ba8fb5?w=600&h=400&fit=crop';

export default function ArticleCard({ article }: { article: Article }) {
  const [imgSrc, setImgSrc] = useState(article.image);

  return (
    <Link href={`/blog/${article.slug}.html`}>
      <div className="group cursor-pointer">
        <div className="relative w-full h-64 rounded-lg overflow-hidden mb-5 bg-[#0F0F12] border border-white/5">
          <img
            src={imgSrc}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgSrc(DEFAULT_IMAGE)}
          />
          <div className="absolute top-4 right-4 bg-[#070708]/80 backdrop-blur px-3 py-1 rounded-full">
            <span className="text-xs text-[#B89A6A]">{article.date}</span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-white group-hover:text-[#B89A6A] transition-colors duration-300 mb-2 line-clamp-2">
            {article.title}
          </h3>
          <p className="text-sm text-[#706C66] line-clamp-2">
            {article.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
