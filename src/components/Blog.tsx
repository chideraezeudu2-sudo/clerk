import React, { useEffect } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, RefreshCw } from 'lucide-react';
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

const SITE = 'https://klerk-vert.vercel.app';

function BlogHeader() {
  return (
    <header className="sticky top-0 z-30 bg-[#f3fbe9]/90 backdrop-blur-md border-b border-[#0a2414]/10">
      <div className="max-w-[1080px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="#" className="text-[21px] font-semibold tracking-[-0.04em] text-[#0a2414] inline-flex items-baseline">
          <span>Klerk</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#1ad379] inline-block ml-0.5 mb-0.5" />
        </a>
        <nav className="flex items-center gap-5 text-[14px]">
          <a href="#" className="text-[#607166] hover:text-[#0a2414] transition-colors">Home</a>
          <a href="#" className="px-4 py-2 rounded-full bg-[#17b267] text-white font-medium hover:bg-[#129556] transition-colors">
            Get started
          </a>
        </nav>
      </div>
    </header>
  );
}

function MetaRow({ post, light = false }: { post: BlogPost; light?: boolean }) {
  const tone = light ? 'text-[#9db5a4]' : 'text-[#607166]';
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] ${tone}`}>
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="w-3.5 h-3.5" /> {post.published}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <RefreshCw className="w-3.5 h-3.5" /> Updated {post.updated}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock3 className="w-3.5 h-3.5" /> {post.readingMinutes} min read
      </span>
    </div>
  );
}

const PostCard: React.FC<{ post: BlogPost; featured?: boolean }> = ({ post, featured = false }) => {
  return (
    <a
      href={`#/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-[16px] bg-white border border-[#0a2414]/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-16px_rgba(10,36,20,0.25)] hover:border-[#17b267]/40"
    >
      {post.image && (
        <div className="relative h-44 overflow-hidden bg-[#0a2414]/5">
          <img
            src={post.image}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#0a2414]/85 text-[#baf3d2] text-[11px] font-medium tracking-wide backdrop-blur-sm">
            {post.kind === 'product' ? 'Product' : 'Notes'}
          </span>
        </div>
      )}
      <div className="flex flex-col flex-1 p-6">
        {!post.image && (
          <span className="self-start px-2.5 py-1 rounded-full bg-[#17b267]/10 text-[#129556] text-[11px] font-semibold tracking-wide mb-3">
            {post.kind === 'product' ? 'Product' : 'Notes'}
          </span>
        )}
        <h3 className={`font-semibold tracking-tight text-[#0a2414] group-hover:text-[#129556] transition-colors ${featured ? 'text-[22px]' : 'text-[19px]'}`}>
          {post.title}
        </h3>
        <p className="text-[14px] text-[#4c5f52] leading-relaxed mt-2 mb-5 line-clamp-3">{post.description}</p>
        <div className="mt-auto flex items-center justify-between">
          <MetaRow post={post} />
          <ArrowRight className="w-4 h-4 text-[#17b267] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </div>
      </div>
    </a>
  );
};

export function BlogIndex() {
  useEffect(() => {
    injectJsonLd('ld-org', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Klerk',
      url: SITE,
      description:
        'Klerk is signal-based cold outreach. It watches hiring, funding, and tech-stack signals, then drafts cited Gmail-powered emails, and a human always reviews before send.',
    });
    return () => removeJsonLd('ld-org');
  }, []);

  const products = BLOG_POSTS.filter((p) => p.kind === 'product');
  const posts = BLOG_POSTS.filter((p) => p.kind === 'blog');

  return (
    <div className="min-h-screen bg-[#f3fbe9]">
      <BlogHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_70%_0%,rgba(26,211,121,0.14),transparent)]" />
        <div className="relative max-w-[1080px] mx-auto px-4 sm:px-6 pt-20 pb-14">
          <span className="inline-block px-3 py-1 rounded-full border border-[#17b267]/30 bg-white/70 text-[#129556] text-[12px] font-semibold tracking-wide mb-5">
            The Klerk Blog
          </span>
          <h1 className="text-[42px] sm:text-[56px] leading-[1.05] font-semibold tracking-[-0.03em] text-[#0a2414] max-w-2xl">
            Signals, sending, and the craft of cold email.
          </h1>
          <p className="mt-4 text-[16px] text-[#4c5f52] max-w-xl leading-relaxed">
            Deep-dives on how Klerk works, plus field notes on deliverability, targeting, and go-to-market.
          </p>
        </div>
      </section>

      {/* Product deep-dives */}
      {products.length > 0 && (
        <section className="max-w-[1080px] mx-auto px-4 sm:px-6 pb-14">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#607166]">Product deep-dives</h2>
            <div className="flex-1 h-px bg-[#0a2414]/10" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {products.map((p, i) => (
              <PostCard key={p.slug} post={p} featured={i === 0} />
            ))}
          </div>
        </section>
      )}

      {/* Notes */}
      {posts.length > 0 && (
        <section className="max-w-[1080px] mx-auto px-4 sm:px-6 pb-20">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#607166]">Notes</h2>
            <div className="flex-1 h-px bg-[#0a2414]/10" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {posts.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}

      {/* CTA band */}
      <section className="max-w-[1080px] mx-auto px-4 sm:px-6 pb-24">
        <div className="rounded-[20px] bg-[#0a2414] px-8 py-12 sm:px-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-[26px] sm:text-[30px] font-semibold tracking-tight text-white leading-tight">
              Stop guessing who's ready to buy.
            </h2>
            <p className="text-[14px] text-[#9db5a4] mt-2 max-w-md">
              Klerk watches hiring, funding, and tech-stack signals, then drafts the email that cites the real reason.
            </p>
          </div>
          <a
            href="#"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1ad379] text-[#0a2414] text-[15px] font-semibold hover:bg-[#4ce39a] transition-colors"
          >
            Try Klerk free <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
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
      author: { '@type': 'Organization', name: 'Klerk', url: SITE },
      publisher: { '@type': 'Organization', name: 'Klerk', url: SITE },
    });
    return () => removeJsonLd('ld-article');
  }, [post.title, post.description, post.published, post.updated]);

  return (
    <div className="min-h-screen bg-[#f3fbe9]">
      <BlogHeader />

      <article className="max-w-[720px] mx-auto px-4 sm:px-6 pt-12 pb-24 text-[#0a2414]">
        <a href="#/blog" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#129556] hover:text-[#0a2414] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> All posts
        </a>

        <div className="mt-6 mb-3">
          <span className="px-2.5 py-1 rounded-full bg-[#17b267]/10 text-[#129556] text-[11px] font-semibold tracking-wide">
            {post.kind === 'product' ? 'Product deep-dive' : 'Notes'}
          </span>
        </div>

        <h1 className="text-[34px] sm:text-[42px] leading-[1.12] font-semibold tracking-[-0.02em]">
          {post.title}
        </h1>
        <div className="mt-4 mb-8">
          <MetaRow post={post} />
        </div>

        {post.image && (
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-64 object-cover rounded-[16px] mb-8 border border-[#0a2414]/10 shadow-[0_12px_32px_-16px_rgba(10,36,20,0.25)]"
            loading="lazy"
          />
        )}

        <p className="text-[17.5px] leading-[1.6] font-medium text-[#283a2e] mb-10 pb-8 border-b border-[#0a2414]/12">
          {post.description}
        </p>

        {post.body.map((sec, i) => {
          if (sec.list) {
            return (
              <ul key={i} className="my-6 space-y-3">
                {sec.list.map((li, j) => (
                  <li key={j} className="flex gap-3 text-[15.5px] leading-[1.65] text-[#283a2e]">
                    <span className="mt-[9px] w-1.5 h-1.5 rounded-full bg-[#17b267] shrink-0" />
                    <span>{li}</span>
                  </li>
                ))}
              </ul>
            );
          }
          if (sec.faq) {
            return (
              <div key={i} className="space-y-4 my-8">
                {sec.faq.map((f, j) => (
                  <div key={j} className="rounded-[12px] border border-[#17b267]/25 bg-white p-5">
                    <div className="font-semibold text-[15px] mb-1.5 flex gap-2">
                      <span className="text-[#17b267]">Q.</span> {f.q}
                    </div>
                    <div className="text-[14.5px] leading-[1.6] text-[#4c5f52] pl-6">{f.a}</div>
                  </div>
                ))}
              </div>
            );
          }
          if (sec.h) {
            return (
              <h2 key={i} className="text-[22px] font-semibold tracking-tight mt-10 mb-3 flex items-center gap-3">
                <span className="w-6 h-[3px] rounded-full bg-[#1ad379] shrink-0" />
                {sec.h}
              </h2>
            );
          }
          return (
            <p key={i} className="text-[15.5px] leading-[1.7] my-5 text-[#283a2e]">
              {sec.p}
            </p>
          );
        })}

        <div className="mt-14 rounded-[16px] bg-[#0a2414] px-7 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <div className="text-white font-semibold text-[18px] tracking-tight">Try Klerk on your own list</div>
            <div className="text-[#9db5a4] text-[13.5px] mt-1">Signals in, cited drafts out. You approve every send.</div>
          </div>
          <a
            href="#"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1ad379] text-[#0a2414] text-[14px] font-semibold hover:bg-[#4ce39a] transition-colors"
          >
            Get started <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </article>
    </div>
  );
}

export function BlogRouter() {
  const [path, setPath] = React.useState(window.location.hash || '#/blog');
  React.useEffect(() => {
    const onHash = () => setPath(window.location.hash || '#/blog');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const slug = decodeURIComponent(
    (path || '').replace(/^#\/?blog\/?/, '').replace(/\/+$/, '')
  );
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  const isIndex = !slug || slug === '';

  return isIndex ? (
    <BlogIndex />
  ) : post ? (
    <BlogPostView post={post} />
  ) : (
    <div className="min-h-screen bg-[#f3fbe9]">
      <BlogHeader />
      <div className="max-w-xl mx-auto px-4 py-32 text-center">
        <h1 className="text-2xl font-semibold mb-2 text-[#0a2414]">Post not found</h1>
        <a href="#/blog" className="text-[#17b267] hover:underline text-[14px]">
          Back to blog
        </a>
      </div>
    </div>
  );
}
