'use client';
import { useState } from 'react';

interface AdminComment {
  id: string;
  post_slug: string;
  postSlug: string;
  author_name: string;
  author: string;
  content: string;
  is_ai: boolean;
  authorType: string;
  aiModel?: string | null;
  author_emoji: string;
  approved: boolean;
  created_at: string;
  createdAt: string;
}

export function CommentManager() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [adminKey, setAdminKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    if (!adminKey.trim()) {
      setError('请输入 Admin Secret Key');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/comments', {
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (res.status === 403) {
        setError('❌ 密钥错误，拒绝访问');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setComments(data.comments || []);
    } catch {
      setError('加载失败，请检查网络');
    }
    setLoading(false);
  };

  const deleteComment = async (id: string) => {
    if (!confirm('确定删除这条评论？')) return;
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(`删除失败: ${data.error || res.statusText}`);
        return;
      }
      setComments(prev => prev.filter(c => c.id !== id));
    } catch {
      alert('删除失败，请检查网络');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4" style={{ color: '#00D4FF' }}>
        评论管理
      </h2>

      {/* Admin key input */}
      <div className="mb-4 flex gap-2">
        <input
          type="password"
          value={adminKey}
          onChange={e => setAdminKey(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchAll()}
          placeholder="Admin Secret Key"
          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
        />
        <button
          onClick={fetchAll}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm disabled:opacity-50"
          style={{ background: 'rgba(0,212,255,0.15)', color: '#00D4FF' }}
        >
          {loading ? '加载中...' : '加载评论'}
        </button>
      </div>

      {error && (
        <p className="mb-3 text-sm text-red-400">{error}</p>
      )}

      {/* Stats */}
      {comments.length > 0 && (
        <p className="mb-3 text-xs text-slate-500">
          共 {comments.length} 条评论（最多显示100条）
        </p>
      )}

      {/* Comment list */}
      <div className="flex flex-col gap-3">
        {comments.map(c => (
          <div
            key={c.id}
            className="flex items-start gap-3 p-3 rounded-lg"
            style={{
              background: '#0D1825',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <span className="text-lg flex-shrink-0">{c.author_emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-medium text-white">
                  {c.author_name || c.author}
                </span>
                {c.is_ai && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(0,212,255,0.1)', color: '#00D4FF' }}
                  >
                    AI{c.aiModel ? ` · ${c.aiModel}` : ''}
                  </span>
                )}
                <span
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    background: c.approved ? 'rgba(34,197,94,0.1)' : 'rgba(251,191,36,0.1)',
                    color: c.approved ? '#22c55e' : '#fbbf24',
                  }}
                >
                  {c.approved ? '已审核' : '待审核'}
                </span>
                <span className="text-xs text-slate-600">
                  {c.post_slug || c.postSlug}
                </span>
              </div>
              <p className="text-sm text-slate-400 line-clamp-2">{c.content}</p>
              <p className="text-xs text-slate-600 mt-1">
                {new Date(c.created_at || c.createdAt).toLocaleString('zh-CN')}
              </p>
            </div>
            <button
              onClick={() => deleteComment(c.id)}
              className="flex-shrink-0 text-red-400 hover:text-red-300 transition-colors p-1"
              title="删除评论"
            >
              🗑️
            </button>
          </div>
        ))}
        {!loading && comments.length === 0 && (
          <p className="text-sm text-slate-600 py-6 text-center">
            暂无评论或未加载
          </p>
        )}
      </div>
    </div>
  );
}
