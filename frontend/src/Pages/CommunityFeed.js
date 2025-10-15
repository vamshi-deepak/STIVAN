import React, { useEffect, useMemo, useState } from 'react';
import { API_ENDPOINTS } from '../config/api';
import './CSS/Community.css';

// Attempt to import socket.io-client dynamically; fall back gracefully if not installed
async function getSocket() {
  try {
    const mod = await import('socket.io-client');
    return mod.io;
  } catch {
    return null;
  }
}

function Avatar({ user, size=36 }){
  const letter = (user?.name || 'U').charAt(0).toUpperCase();
  return (
    <div className="avatar">
      {user?.profilePicture ? (
        <img alt="avatar" src={user.profilePicture} style={{ width:size, height:size, borderRadius:size/2, objectFit:'cover' }} />
      ) : (
        <div className="circle" style={{ width:size, height:size, borderRadius:size/2 }}>{letter}</div>
      )}
      <div style={{ fontWeight:600 }}>{user?.name || 'User'}</div>
    </div>
  )
}

function PostCard({ post, onLike, onOpenComments }){
  return (
    <div className="post-card">
      <div className="post-head">
        <Avatar user={post.user} />
        <div className="post-time">{new Date(post.createdAt).toLocaleString()}</div>
      </div>
      <div className="post-content">{post.content}</div>
      {post.idea && (
        <div className="linked-idea">
          Linked Idea: {post.idea?.title || 'Idea'}
        </div>
      )}
      <div className="post-actions">
        <button className="btn-like" onClick={() => onLike(post)}>Like ({post.likesCount||0})</button>
        <button className="btn-comment" onClick={() => onOpenComments(post)}>Comments ({post.commentsCount||0})</button>
      </div>
    </div>
  )
}

function Comments({ postId, open, onClose }){
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!open) return;
    const fetchComments = async () => {
      const res = await fetch(API_ENDPOINTS.communityComments(postId), { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setComments(data.data || []);
    };
    fetchComments();
  }, [open, postId]);

  const addComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const token = localStorage.getItem('token');
    const res = await fetch(API_ENDPOINTS.communityComments(postId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    if (res.ok) {
      setComments(prev => [...prev, data.data]);
      setText('');
    }
  };

  if (!open) return null;
  return (
    <div className="comments-drawer">
      <div className="comments-head">
        <div style={{ fontWeight:700 }}>Comments</div>
        <button onClick={onClose} style={{ border:'none', background:'transparent', fontSize:18, cursor:'pointer' }}>×</button>
      </div>
      <div className="comments-body">
        {comments.map(c => (
          <div key={c._id} className="comment-item">
            <Avatar user={c.user} />
            <div style={{ marginTop:6, color:'#111827' }}>{c.text}</div>
            <div className="post-time">{new Date(c.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
      <form onSubmit={addComment} className="comments-form">
        <input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Write a comment" />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}

export default function CommunityFeed(){
  const [tab, setTab] = useState('all');
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [commentsFor, setCommentsFor] = useState(null);

  const token = useMemo(() => localStorage.getItem('token'), []);

  const loadFeed = async (reset=false) => {
    const p = reset ? 1 : page;
    const res = await fetch(`${API_ENDPOINTS.communityFeed}?tab=${tab}&page=${p}&limit=10`, { headers: { 'Authorization': `Bearer ${token}` }});
    const data = await res.json();
    if (res.ok) {
      const list = data.data || [];
      setHasMore(list.length === 10);
      if (reset) setPosts(list); else setPosts(prev => [...prev, ...list]);
      if (reset) setPage(2); else setPage(p+1);
    }
  };

  useEffect(() => { setPage(1); setHasMore(true); loadFeed(true); }, [tab]);

  useEffect(() => {
    let socket;
    (async () => {
      const io = await getSocket();
      if (!io) return;
      socket = io(`${window.location.origin}`);
      socket.on('post:new', (post) => {
        // Insert into All tab immediately
        if (tab === 'all') setPosts(prev => [post, ...prev]);
      });
      socket.on('like:update', ({ postId, likesCount }) => {
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, likesCount } : p));
      });
      socket.on('comment:new', (comment) => {
        setPosts(prev => prev.map(p => p._id === comment.post ? { ...p, commentsCount: (p.commentsCount||0)+1 } : p));
      });
    })();
    return () => { try { socket && socket.disconnect(); } catch {} };
  }, [tab]);

  const submitPost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    const res = await fetch(API_ENDPOINTS.communityPosts, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ content })
    });
    const data = await res.json();
    if (res.ok) {
      setContent('');
      // Socket handler will prepend to All; also update local immediately for responsiveness
      setPosts(prev => tab === 'all' ? [data.data, ...prev] : prev);
    }
  };

  const toggleLike = async (post) => {
    const res = await fetch(API_ENDPOINTS.communityLike(post._id), { method:'POST', headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) {
      setPosts(prev => prev.map(p => p._id === post._id ? { ...p, likesCount: data.data.likesCount } : p));
    }
  };

  return (
    <div className="community-container">
      <h2 className="community-title">Community</h2>
      <div className="community-sub">Share ideas, get feedback, and see what others are building.</div>

      <div className="community-tabs">
        <button onClick={()=>setTab('all')} className={tab==='all' ? 'btn-primary' : 'btn'}>All Ideas</button>
        <button onClick={()=>setTab('my')} className={tab==='my' ? 'btn-primary' : 'btn'}>My Ideas</button>
        <button onClick={()=>setTab('top')} className={tab==='top' ? 'btn-primary' : 'btn'}>Top Rated</button>
      </div>

      <form onSubmit={submitPost} className="composer">
        <textarea placeholder="Share your idea..." value={content} onChange={(e)=>setContent(e.target.value)} />
        <div className="actions">
          <button type="submit" className="btn-primary">Post</button>
        </div>
      </form>

      {posts.map(p => (
        <PostCard key={p._id} post={p} onLike={toggleLike} onOpenComments={(post)=>setCommentsFor(post)} />
      ))}

      {hasMore && (
        <div style={{ display:'flex', justifyContent:'center', marginTop:8 }}>
          <button onClick={()=>loadFeed(false)} className="btn">Load more</button>
        </div>
      )}

      <Comments postId={commentsFor?._id} open={!!commentsFor} onClose={()=>setCommentsFor(null)} />
    </div>
  );
}
