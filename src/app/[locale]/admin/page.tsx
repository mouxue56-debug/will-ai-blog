'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import {
  FileText, MessageSquare, Inbox, Plus, Check, X, Trash2, Edit3, Send,
  Bot, User, Filter, RefreshCw, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Types ─── */
interface PostItem {
  slug: string;
  title: string;
  category: string;
  date: string;
  author: string;
  authorType: string;
  aiModel?: string;
  status: string;
}

interface CommentItem {
  id: string;
  postSlug: string;
  author: string;
  content: string;
  authorType: string;
  aiModel?: string;
  aiInstance?: string;
  createdAt: string;
  approved: boolean;
}

/* ─── Tab Button ─── */
function TabButton({
  active, onClick, icon: Icon, label, count
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all',
        active
          ? 'bg-brand-cyan/15 text-brand-cyan'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
      {count !== undefined && count > 0 && (
        <span className="ml-1 rounded-full bg-brand-cyan/20 px-1.5 py-0.5 text-[10px] font-bold">
          {count}
        </span>
      )}
    </button>
  );
}

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    published: 'bg-green-500/15 text-green-600',
    draft: 'bg-amber-500/15 text-amber-600',
  };
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', colors[status] || 'bg-muted text-muted-foreground')}>
      {status}
    </span>
  );
}

/* ═══════════════════════ Posts Tab ═══════════════════════ */
function PostsTab({}) {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('ai');

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const url = statusFilter === 'all' ? '/api/posts' : `/api/posts?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const publishPost = async (slug: string) => {
    await fetch(`/api/posts/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json',  },
      body: JSON.stringify({ status: 'published' }),
    });
    fetchPosts();
  };

  const deletePost = async (slug: string) => {
    if (!confirm(`Delete "${slug}"?`)) return;
    await fetch(`/api/posts/${slug}`, {
      method: 'DELETE',
      headers: {  },
    });
    fetchPosts();
  };

  const openEdit = async (slug: string) => {
    const res = await fetch(`/api/posts/${slug}`);
    const data = await res.json();
    setEditSlug(slug);
    setEditContent(data.raw || '');
  };

  const saveEdit = async () => {
    if (!editSlug) return;
    await fetch(`/api/posts/${editSlug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json',  },
      body: JSON.stringify({ content: editContent }),
    });
    setEditSlug(null);
    fetchPosts();
  };

  const createPost = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',  },
      body: JSON.stringify({
        title: newTitle,
        content: newContent,
        category: newCategory,
        authorType: 'human',
        author: 'Will',
      }),
    });
    setShowNew(false);
    setNewTitle('');
    setNewContent('');
    fetchPosts();
  };

  // Edit modal
  if (editSlug) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Edit: {editSlug}</h3>
          <div className="flex gap-2">
            <button onClick={saveEdit} className="rounded-lg bg-brand-cyan px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-cyan/90">
              Save
            </button>
            <button onClick={() => setEditSlug(null)} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted">
              Cancel
            </button>
          </div>
        </div>
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="h-[60vh] w-full rounded-lg border bg-muted/30 p-4 font-mono text-sm"
        />
      </div>
    );
  }

  // New post form
  if (showNew) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">New Post</h3>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Title"
          className="w-full rounded-lg border bg-muted/30 px-4 py-2 text-sm"
        />
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="rounded-lg border bg-muted/30 px-3 py-2 text-sm"
        >
          <option value="ai">AI</option>
          <option value="tech">Tech</option>
          <option value="life">Life</option>
          <option value="cats">Cats</option>
          <option value="business">Business</option>
        </select>
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Markdown content..."
          className="h-[40vh] w-full rounded-lg border bg-muted/30 p-4 font-mono text-sm"
        />
        <div className="flex gap-2">
          <button onClick={createPost} className="rounded-lg bg-brand-cyan px-4 py-2 text-sm font-medium text-white hover:bg-brand-cyan/90">
            Create Draft
          </button>
          <button onClick={() => setShowNew(false)} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {['all', 'draft', 'published'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                statusFilter === s ? 'bg-brand-cyan/15 text-brand-cyan' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={fetchPosts} className="rounded-lg border p-2 hover:bg-muted">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 rounded-lg bg-brand-cyan px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-cyan/90"
          >
            <Plus className="h-4 w-4" /> New Post
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">No posts found</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Title</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Author</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {posts.map((post) => {
                // Parse title — might be JSON string from frontmatter
                let displayTitle = post.slug;
                try {
                  const parsed = typeof post.title === 'string' && post.title.startsWith('{')
                    ? JSON.parse(post.title) : post.title;
                  if (typeof parsed === 'object') {
                    displayTitle = parsed.zh || parsed.en || parsed.ja || post.slug;
                  } else {
                    displayTitle = String(parsed);
                  }
                } catch {
                  displayTitle = String(post.title);
                }

                return (
                  <tr key={post.slug} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium max-w-[300px] truncate">{displayTitle}</td>
                    <td className="px-4 py-3"><StatusBadge status={post.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{post.category}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1">
                        {post.authorType === 'ai' ? <Bot className="h-3 w-3 text-brand-cyan" /> : <User className="h-3 w-3" />}
                        {post.author}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{post.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(post.slug)} className="rounded p-1.5 hover:bg-muted" title="Edit">
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        {post.status === 'draft' && (
                          <button onClick={() => publishPost(post.slug)} className="rounded p-1.5 hover:bg-green-500/10 text-green-600" title="Publish">
                            <Send className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button onClick={() => deletePost(post.slug)} className="rounded p-1.5 hover:bg-red-500/10 text-red-500" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════ Comments Tab ═══════════════════════ */
function CommentsTab({}) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/comments?approved=false');
      const data = await res.json();
      setComments(data.comments || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const updateComment = async (id: string, postSlug: string, approved: boolean) => {
    await fetch('/api/comments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, postSlug, approved }),
    });
    fetchComments();
  };

  const deleteComment = async (id: string, postSlug: string) => {
    if (!confirm('Delete this comment?')) return;
    await fetch(`/api/comments?id=${encodeURIComponent(id)}&postSlug=${encodeURIComponent(postSlug)}`, {
      method: 'DELETE',
    });
    fetchComments();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{comments.length} comments total</p>
        <button onClick={fetchComments} className="rounded-lg border p-2 hover:bg-muted">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading...</div>
      ) : comments.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">No comments</div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={cn(
                'rounded-lg border p-4 transition-colors',
                comment.approved ? 'border-green-500/20 bg-green-500/5' : 'border-amber-500/20 bg-amber-500/5'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold">{comment.author}</span>
                    {comment.authorType === 'ai' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-cyan/15 px-2 py-0.5 text-[10px] font-medium text-brand-cyan">
                        <Bot className="h-3 w-3" /> AI · {comment.aiModel}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">on {comment.postSlug}</span>
                    <StatusBadge status={comment.approved ? 'published' : 'draft'} />
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{comment.content}</p>
                  <p className="text-[11px] text-muted-foreground/70">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {!comment.approved && (
                    <button
                      onClick={() => updateComment(comment.id, comment.postSlug, true)}
                      className="rounded p-1.5 hover:bg-green-500/10 text-green-600"
                      title="Approve"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  {comment.approved && (
                    <button
                      onClick={() => updateComment(comment.id, comment.postSlug, false)}
                      className="rounded p-1.5 hover:bg-amber-500/10 text-amber-600"
                      title="Unapprove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteComment(comment.id, comment.postSlug)}
                    className="rounded p-1.5 hover:bg-red-500/10 text-red-500"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════ Drafts Queue Tab ═══════════════════════ */
function DraftsQueueTab({}) {
  const [drafts, setDrafts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState('');

  const fetchDrafts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts?status=draft');
      const data = await res.json();
      // Only AI-authored drafts
      const aiDrafts = (data.posts || []).filter((p: PostItem) => p.authorType === 'ai');
      setDrafts(aiDrafts);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchDrafts(); }, [fetchDrafts]);

  const publishDraft = async (slug: string) => {
    await fetch(`/api/posts/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json',  },
      body: JSON.stringify({ status: 'published' }),
    });
    fetchDrafts();
  };

  const rejectDraft = async (slug: string) => {
    if (!confirm(`Reject and delete "${slug}"?`)) return;
    await fetch(`/api/posts/${slug}`, {
      method: 'DELETE',
      headers: {  },
    });
    fetchDrafts();
  };

  const previewDraft = async (slug: string) => {
    const res = await fetch(`/api/posts/${slug}`);
    const data = await res.json();
    setPreviewSlug(slug);
    setPreviewContent(data.content || data.raw || '');
  };

  if (previewSlug) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Preview: {previewSlug}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => { publishDraft(previewSlug); setPreviewSlug(null); }}
              className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
            >
              <Send className="h-4 w-4" /> Publish
            </button>
            <button onClick={() => setPreviewSlug(null)} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted">
              Back
            </button>
          </div>
        </div>
        <pre className="whitespace-pre-wrap rounded-lg border bg-muted/30 p-4 text-sm max-h-[60vh] overflow-y-auto">
          {previewContent}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{drafts.length} AI drafts pending review</p>
        <button onClick={fetchDrafts} className="rounded-lg border p-2 hover:bg-muted">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading...</div>
      ) : drafts.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <Inbox className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
          No AI drafts pending review
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map((draft) => {
            let displayTitle = draft.slug;
            try {
              const parsed = typeof draft.title === 'string' && draft.title.startsWith('{')
                ? JSON.parse(draft.title) : draft.title;
              if (typeof parsed === 'object') {
                displayTitle = parsed.zh || parsed.en || parsed.ja || draft.slug;
              } else {
                displayTitle = String(parsed);
              }
            } catch {
              displayTitle = String(draft.title);
            }

            return (
              <div key={draft.slug} className="rounded-lg border p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <h4 className="font-medium">{displayTitle}</h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Bot className="h-3 w-3 text-brand-cyan" />
                        {draft.aiModel || 'AI'}
                      </span>
                      <span>{draft.category}</span>
                      <span>{draft.date}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => previewDraft(draft.slug)}
                      className="rounded p-1.5 hover:bg-muted"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => publishDraft(draft.slug)}
                      className="rounded p-1.5 hover:bg-green-500/10 text-green-600"
                      title="Publish"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => rejectDraft(draft.slug)}
                      className="rounded p-1.5 hover:bg-red-500/10 text-red-500"
                      title="Reject"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════ Main Admin Page ═══════════════════════ */
type TabType = 'posts' | 'comments' | 'drafts';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const isAdmin = (session?.user as Record<string, unknown>)?.role === 'admin';

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session || !isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Admin Access Required</h1>
          <p className="text-muted-foreground">Please sign in with admin credentials</p>
          <button
            onClick={() => signIn('credentials', { callbackUrl: '/admin' })}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-mint px-6 py-2.5 text-sm font-semibold text-slate-950 hover:opacity-90 transition-opacity"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage posts, comments, and AI draft queue</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-1 glass-card p-1 w-fit">
        <TabButton active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} icon={FileText} label="Posts" />
        <TabButton active={activeTab === 'comments'} onClick={() => setActiveTab('comments')} icon={MessageSquare} label="Comments" />
        <TabButton active={activeTab === 'drafts'} onClick={() => setActiveTab('drafts')} icon={Inbox} label="Draft Queue" />
      </div>

      {/* Tab Content */}
      <div className="min-h-[50vh]">
        {activeTab === 'posts' && <PostsTab  />}
        {activeTab === 'comments' && <CommentsTab  />}
        {activeTab === 'drafts' && <DraftsQueueTab  />}
      </div>
    </div>
  );
}
