import React, { useEffect } from 'react';
import { BLOG_POSTS, BlogPost } from '../data/blogPosts';

function injectJsonLd(id: string, data: object) {
  const el = document.createElement('script');
  el.type = 'application/ld+json';
  el.id = id;
  el.text = JSON.stringify(data);
  document.head.appendChild(el);
}
function removeJsonLd(id: string) {
  document.getElementById(id)?.remove();
}

const SITE = 'https://clerk-vert.vercel.app';

export function BlogIndex() {
  useEffect(() => {
    injectJsonLd('ld-org', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'clerk',
      url: SITE,
      description: 'Signal-based cold outreach — watches hiring, funding, and tech-stack signals and drafts cited Gmail-powered emails.',
    });
    return () => removeJsonLd('ld-org');
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight mb-2">clerk — Blog</h1>
      <p className="text-[#607166] mb-10">Signal-based outreach, deliverability, and go-to-market notes.</p>
      <div className="space-y-8">
        {BLOG_POSTS.map((p) => (
          <a key={p.slug} href={`#/blog/${p.slug}`} className="block group border-b border-[#0a2414]/10 pb-6">
            <h2 className="text-xl font-semibold text-[#0a2414] group-hover:text-[#17b267] transition-colors">{p.title}</h2>
            <div className="text-[12px] text-[#607166] mt-1 mb-2">
              {p.published} · updated {p.updated} · {p.readingMinutes} min read
            </div>
            <p className="text-[14.5px] text-[#283a2e] leading-relaxed">{p.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

export function BlogPostView({ post }: { post: BlogPost }) {
  useEffect(() => {
    injectJsonLd('ld-article', {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.description,
      datePublished: post.published,
      dateModified: post.updated,
      author: { '@type': 'Organization', name: 'clerk', url: SITE },
      publisher: { '@type': 'Organization', name: 'clerk', url: SITE },
    });
    return () => removeJsonLd('ld-article');
  }, [post.title, post.description, post.published, post.updated]);

  return (
    <article className="max-w-2xl mx-auto px-4 py-16 text-[#0a2414]">
      <a href="#/blog" className="text-[13px] text-[#17b267] hover:underline">← all posts</a>
      <h1 className="text-3xl font-semibold tracking-tight mt-4 mb-2">{post.title}</h1>
      <div className="text-[12.5px] text-[#607166] mb-6">
        Published {post.published} · updated {post.updated} · {post.readingMinutes} min read
      </div>
      {/* Direct-answer block (~40-60 words) for AEO/featured snippets */}
      <p className="text-[16px] leading-relaxed font-medium mb-8 pb-6 border-b border-[#0a2414]/12">
        {post.description}
      </p>
      {post.body.map((sec, i) => {
        if (sec.list) {
          return (
            <ul key={i} className="list-disc pl-5 my-5 space-y-2 text-[15px] text-[#283a2e]">
              {sec.list.map((li, j) => <li key={j}>{li}</li>)}
            </ul>
          );
        }
        if (sec.faq) {
          return (
            <div key={i} className="space-y-4 my-6">
              {sec.faq.map((f, j) => (
                <div key={j} className="rounded-[8px] border border-[#0a2414]/10 p-4">
                  <div className="font-semibold text-[15px] mb-1">{f.q}</div>
                  <div className="text-[14.5px] text-[#283a2e]">{f.a}</div>
                </div>
              ))}
            </div>
          );
        }
        if (sec.h) return <h2 key={i} className="text-xl font-semibold mt-8 mb-3">{sec.h}</h2>;
        return <p key={i} className="text-[15.5px] leading-[1.65] my-4 text-[#283a2e]">{sec.p}</p>;
      })}
    </article>
  );
}

export function BlogRouter() {
  const [path, setPath] = React.useState(window.location.hash || '#/blog');
  React.useEffect(() => {
    const onHash = () => setPath(window.location.hash || '#/blog');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const slug = path.replace('#/blog/', '').replace('#/blog', '').replace(/^\/+/, '');
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  const isIndex = !slug || slug === '';

  return (
    <div className="min-h-screen bg-[#f3fbe9]">
      {isIndex ? (
        <BlogIndex />
      ) : post ? (
        <BlogPostView post={post} />
      ) : (
        <div className="max-w-xl mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-semibold mb-2">Post not found</h1>
          <a href="#/blog" className="text-[#17b267] hover:underline text-[14px]">Back to blog</a>
        </div>
      )}
    </div>
  );
}
