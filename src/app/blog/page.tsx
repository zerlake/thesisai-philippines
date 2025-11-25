'use client';

import Link from 'next/link';
import { ArrowRight, Calendar, User } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  slug: string;
  image: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Master Academic Writing with AI-Powered Grammar Checking',
    excerpt:
      'Learn how our advanced grammar checking system helps you improve essay quality and academic writing standards.',
    author: 'Dr. Sarah Johnson',
    date: 'November 20, 2025',
    category: 'Writing Tips',
    slug: 'master-academic-writing',
    image: '/images/blog/writing-tips.jpg',
  },
  {
    id: '2',
    title: 'Topic Generation Strategies for Research Papers',
    excerpt:
      'Discover effective strategies for generating compelling research topics using intelligent AI assistance.',
    author: 'Prof. Michael Chen',
    date: 'November 15, 2025',
    category: 'Research',
    slug: 'topic-generation-strategies',
    image: '/images/blog/research-tips.jpg',
  },
  {
    id: '3',
    title: 'Identifying Research Gaps: A Comprehensive Guide',
    excerpt:
      'Understand how to find and articulate research gaps in your academic work for stronger papers.',
    author: 'Dr. Emily Rodriguez',
    date: 'November 10, 2025',
    category: 'Academic Excellence',
    slug: 'identifying-research-gaps',
    image: '/images/blog/research-gaps.jpg',
  },
  {
    id: '4',
    title: 'Paraphrasing Best Practices for Academic Integrity',
    excerpt:
      'Learn proper paraphrasing techniques that maintain academic integrity while avoiding plagiarism.',
    author: 'Prof. James Wilson',
    date: 'November 5, 2025',
    category: 'Academic Integrity',
    slug: 'paraphrasing-best-practices',
    image: '/images/blog/paraphrasing.jpg',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white">Blog</h1>
          <p className="mt-4 text-lg text-slate-300">
            Insights, tips, and strategies for academic excellence
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Featured Post */}
        <div className="mb-16 overflow-hidden rounded-lg border border-slate-700 bg-slate-800 shadow-lg">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex h-64 items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 md:h-auto">
              <div className="text-center text-white">
                <h3 className="text-2xl font-bold">Featured Post</h3>
              </div>
            </div>
            <div className="flex flex-col justify-center p-6">
              <span className="inline-flex w-fit rounded-full bg-blue-500/20 px-3 py-1 text-sm font-medium text-blue-200">
                {blogPosts[0].category}
              </span>
              <h2 className="mt-4 text-2xl font-bold text-white">
                {blogPosts[0].title}
              </h2>
              <p className="mt-3 text-slate-300">{blogPosts[0].excerpt}</p>
              <div className="mt-6 flex items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {blogPosts[0].author}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {blogPosts[0].date}
                </div>
              </div>
              <Link
                href={`/blog/${blogPosts[0].slug}`}
                className="mt-6 inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700"
              >
                Read Article <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {blogPosts.slice(1).map((post) => (
            <article
              key={post.id}
              className="flex flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-800 transition-shadow hover:shadow-md hover:shadow-blue-500/20"
            >
              <div className="h-48 bg-gradient-to-br from-slate-700 to-slate-600" />
              <div className="flex flex-1 flex-col p-6">
                <span className="inline-flex w-fit rounded-full bg-slate-700 px-3 py-1 text-sm font-medium text-slate-200">
                  {post.category}
                </span>
                <h3 className="mt-4 text-xl font-bold text-white">
                  {post.title}
                </h3>
                <p className="mt-3 flex-1 text-slate-300">{post.excerpt}</p>
                <div className="mt-4 flex items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {post.date}
                  </div>
                </div>
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-4 inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700"
                >
                  Read More <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="mt-20 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12 text-white">
          <h2 className="text-3xl font-bold">Stay Updated</h2>
          <p className="mt-2 text-blue-100">
            Subscribe to our newsletter for tips, strategies, and updates on academic excellence.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-lg px-4 py-3 bg-slate-800 text-white placeholder-slate-500"
            />
            <button className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-600 hover:bg-blue-50">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
