import React, { useEffect, useMemo, useState, useRef } from 'react';
import { API_ENDPOINTS } from '../config/api';
import GradientText from '../components/GradientText/GradientText';
import Toast from '../components/Toast/Toast';
import LoadingSpinner from '../components/Loading/LoadingSpinner';
import './CSS/Community.css';
import axiosInstance from '../utils/axiosConfig';

// Attempt to import socket.io-client dynamically; fall back gracefully if not installed
async function getSocket() {
  try {
    const mod = await import('socket.io-client');
    return mod;
  } catch {
    return null;
  }
}

function Avatar({ user, size=36, showName=true }){
  const letter = (user?.name || 'U').charAt(0).toUpperCase();
  return (
    <div className="avatar">
      {user?.profilePicture ? (
        <img alt="avatar" src={user.profilePicture} style={{ width:size, height:size, borderRadius:size/2, objectFit:'cover' }} />
      ) : (
        <div className="avatar-circle" style={{ width:size, height:size, borderRadius:size/2, fontSize: size/2.5 }}>{letter}</div>
      )}
      {showName && <div className="avatar-name">{user?.name || 'User'}</div>}
    </div>
  )
}

function PostCard({ post, onLike, onOpenComments, isLiked }){
  const [showActions, setShowActions] = useState(false);
  
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="post-card" data-aos="fade-up">
      <div className="post-header">
        <Avatar user={post.user} size={42} />
        <div className="post-meta">
          <span className="post-time">{timeAgo(post.createdAt)}</span>
        </div>
      </div>
      
      <div className="post-content">{post.content}</div>
      
      {post.idea && (
        <div className="linked-idea">
          <i className="fas fa-lightbulb"></i>
          <span>Linked Idea: {post.idea?.title || 'Idea'}</span>
        </div>
      )}
      
      <div className="post-footer">
        <button 
          className={`post-action ${isLiked ? 'active' : ''}`} 
          onClick={() => onLike(post)}
        >
          <i className={`fa${isLiked ? 's' : 'r'} fa-heart`}></i>
          <span>{post.likesCount || 0}</span>
        </button>
        <button className="post-action" onClick={() => onOpenComments(post)}>
          <i className="far fa-comment"></i>
          <span>{post.commentsCount || 0}</span>
        </button>
        {/* Share button removed per design */}
      </div>
    </div>
  )
}

function Comments({ postId, open, onClose }){
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const commentsEndRef = useRef(null);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!open) return;
    const fetchComments = async () => {
      const res = await fetch(API_ENDPOINTS.communityComments(postId), { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) {
        setComments(data.data || []);
        setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
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
      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (!open) return null;
  
  return (
    <>
      <div className="comments-overlay" onClick={onClose}></div>
      <div className="comments-drawer">
        <div className="comments-header">
          <h3>
            <i className="far fa-comments"></i>
            Comments ({comments.length})
          </h3>
          <button onClick={onClose} className="close-btn">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="comments-body">
          {comments.length === 0 ? (
            <div className="no-comments">
              <i className="far fa-comment-dots"></i>
              <p>No comments yet</p>
              <span>Be the first to comment!</span>
            </div>
          ) : (
            comments.map(c => (
              <div key={c._id} className="comment-item" data-aos="fade-left">
                <Avatar user={c.user} size={32} showName={false} />
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-author">{c.user?.name || 'User'}</span>
                    <span className="comment-time">{timeAgo(c.createdAt)}</span>
                  </div>
                  <div className="comment-text">{c.text}</div>
                </div>
              </div>
            ))
          )}
          <div ref={commentsEndRef} />
        </div>
        
        <form onSubmit={addComment} className="comments-form">
          <input 
            value={text} 
            onChange={(e)=>setText(e.target.value)} 
            placeholder="Write a comment..." 
            maxLength={500}
          />
          <button type="submit" disabled={!text.trim()}>
            <i className="fas fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </>
  )
}

// Add these helper functions above the CommunityFeed component
const sortByDate = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);
const sortByLikes = (a, b) => (b.likesCount || 0) - (a.likesCount || 0);
const sortByComments = (a, b) => (b.commentsCount || 0) - (a.commentsCount || 0);

export default function CommunityFeed(){
  const [tab, setTab] = useState('all');
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [commentsFor, setCommentsFor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [stats, setStats] = useState({ posts: 0, members: 0, comments: 0, likes: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeMembers, setActiveMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Add this state for tracking post IDs
  const [processedPosts] = useState(new Set());

  const token = useMemo(() => localStorage.getItem('token'), []);

  // Initialize AOS animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-aos]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [posts]);

  // Load community stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_ENDPOINTS.communityStats, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats(data.data || {
            posts: 0,
            members: 0,
            comments: 0,
            likes: 0
          });
        }
      } catch (error) {
        console.error('Failed to load community stats:', error);
        setStats({
          posts: 0,
          members: 0,
          comments: 0,
          likes: 0
        });
      }
    };
    loadStats();
  }, []);

  const loadFeed = async (reset=false) => {
    const p = reset ? 1 : page;
    setLoading(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.communityFeed}?tab=${tab}&page=${p}&limit=10`, { headers: { 'Authorization': `Bearer ${token}` }});
      if (!res) throw new Error('No response from server');
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        const list = data.data || [];
        setHasMore(list.length === 10);
        if (reset) setPosts(list); else setPosts(prev => [...prev, ...list]);
        if (reset) setPage(2); else setPage(p+1);
      } else {
        console.warn('Failed to load feed', res && res.status, data);
        if (reset) setPosts([]);
      }
    } catch (err) {
      console.error('Error loading community feed:', err);
      if (reset) setPosts([]);
      setHasMore(false);
      setToast({ show: true, message: 'Failed to load posts', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); setHasMore(true); loadFeed(true); }, [tab]);

  // Replace the existing socket useEffect
  useEffect(() => {
    let socket;
    (async () => {
      const mod = await getSocket();
      if (!mod) return;
      // Prefer explicit socket URL from env, then window.location.origin, then local dev fallback
      const SOCKET_URL = (process.env.REACT_APP_SOCKET_URL && process.env.REACT_APP_SOCKET_URL !== 'undefined')
        ? process.env.REACT_APP_SOCKET_URL
        : (window.location.origin || 'http://127.0.0.1:5051');
      const ioClient = mod.io || mod.default || mod;
      try {
        socket = ioClient(SOCKET_URL, { transports: ['websocket', 'polling'] });
      } catch (err) {
        // best-effort: try origin only
        socket = ioClient(window.location.origin);
      }
      socket.on('post:new', (post) => {
        // Only add from socket if NOT created by current user (avoid duplicates from own posts)
        const currentUserId = currentUser?._id;
        const postUserId = post.user?._id || post.userId;
        
        if (postUserId !== currentUserId && tab === 'all') {
          setPosts(prev => {
            // Check if post already exists
            const exists = prev.some(p => p._id === post._id);
            if (exists) return prev;
            return [post, ...prev];
          });
        }
      });
      socket.on('like:update', ({ postId, likesCount }) => {
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, likesCount } : p));
      });
      socket.on('comment:new', (comment) => {
        setPosts(prev => prev.map(p => p._id === comment.post ? { ...p, commentsCount: (p.commentsCount||0)+1 } : p));
      });
    })();
    return () => { try { socket && socket.disconnect(); } catch {} };
  }, [tab, currentUser]);

  const toggleComposer = (value) => {
    setShowComposer(value);
    if (value) {
      // Store current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
  };

  // Update the submitPost function
  const submitPost = async (e) => {
    e.preventDefault();
    
    // Prevent empty or duplicate submissions
    if (isSubmitting || !content.trim() || loading) {
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setToast({
          show: true,
          message: 'Please login to post',
          type: 'error'
        });
        return;
      }

      const response = await fetch(API_ENDPOINTS.communityPosts, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          content: content.trim() 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create post');
      }

      // Reset form state first
      setContent('');
      toggleComposer(false);
      
      // Update posts list with deduplication check
      setPosts(prev => {
        // Check if post already exists
        const exists = prev.some(post => post._id === data._id);
        if (exists) return prev;
        
        // Filter out any empty posts and add new one
        const filteredPosts = prev.filter(post => post.content && post.content.trim());
        return [data, ...filteredPosts];
      });
      
      setToast({
        show: true,
        message: 'Post shared successfully!',
        type: 'success'
      });

    } catch (error) {
      console.error('Post error:', error);
      setToast({
        show: true,
        message: 'Failed to create post. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const toggleLike = async (post) => {
    const wasLiked = likedPosts.has(post._id);
    
    // Optimistic update
    if (wasLiked) {
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(post._id);
        return newSet;
      });
    } else {
      setLikedPosts(prev => new Set(prev).add(post._id));
    }
    
    const res = await fetch(API_ENDPOINTS.communityLike(post._id), { 
      method:'POST', 
      headers: { 'Authorization': `Bearer ${token}` } 
    });
    const data = await res.json();
    
    if (res.ok) {
      setPosts(prev => prev.map(p => p._id === post._id ? { ...p, likesCount: data.data.likesCount } : p));
    } else {
      // Revert optimistic update on failure
      if (wasLiked) {
        setLikedPosts(prev => new Set(prev).add(post._id));
      } else {
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(post._id);
          return newSet;
        });
      }
    }
  };

  // Load current user data
  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const filteredPosts = useMemo(() => {
    let filtered = [...posts];
    
    // Tab filter
    if (tab === 'my') {
      filtered = filtered.filter(post => {
        // Make sure we have both user IDs for comparison
        const postUserId = post.user?._id || post.userId;
        const currentUserId = currentUser?._id;
        return postUserId === currentUserId;
      });
    } else if (tab === 'top') {
      filtered = filtered.filter(post => (post.likesCount || 0) > 5); // Show posts with >5 likes
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.content?.toLowerCase().includes(query) ||
        post.user?.name?.toLowerCase().includes(query) ||
        post.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Sort
    switch (sortBy) {
      case 'popular':
        filtered.sort(sortByLikes);
        break;
      case 'discussed':
        filtered.sort(sortByComments);
        break;
      case 'recent':
      default:
        filtered.sort(sortByDate);
        break;
    }
    
    return filtered;
  }, [posts, searchQuery, sortBy, tab, currentUser]);

  // Add this useEffect to auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Add this after your other useEffect hooks
  useEffect(() => {
    const fetchActiveMembers = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.communityActiveMembers, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch active members');
        
        const data = await response.json();
        // Filter out current user and ensure unique members
        const uniqueMembers = data.data ? data.data.reduce((acc, member) => {
          const memberId = member._id || member.userId;
          if (!acc.some(m => (m._id || m.userId) === memberId)) {
            acc.push(member);
          }
          return acc;
        }, []) : [];

        setActiveMembers(uniqueMembers);
      } catch (error) {
        console.error('Error fetching active members:', error);
        setActiveMembers([]); // Reset on error
      }
    };

    // Initial fetch
    fetchActiveMembers();
    
    // Set up socket connection for real-time updates
    let socket;
    (async () => {
      const mod = await getSocket();
      if (!mod) return;
      
      try {
        const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || window.location.origin;
        const ioClient = mod.io || mod.default;
        socket = ioClient(SOCKET_URL, { transports: ['websocket', 'polling'] });
        
        socket.on('user:active', (user) => {
          setActiveMembers(prev => {
            const exists = prev.some(m => (m._id || m.userId) === (user._id || user.userId));
            if (!exists) return [...prev, user];
            return prev;
          });
        });

        socket.on('user:inactive', (userId) => {
          setActiveMembers(prev => prev.filter(m => (m._id || m.userId) !== userId));
        });
      } catch (err) {
        console.error('Socket connection failed:', err);
      }
    })();

    // Refresh active members every 30 seconds as fallback
    const interval = setInterval(fetchActiveMembers, 30000);
    
    return () => {
      clearInterval(interval);
      if (socket) socket.disconnect();
    };
  }, [token]);

  return (
    <div className="community-page">
      {/* Hero Section */}
      <div className="community-hero">
        <div className="hero-content" data-aos="fade-up">
          <h1>
            <GradientText>Community Hub</GradientText>
          </h1>
          <p className="hero-subtitle">
            Connect with innovators, share ideas, and get feedback from the startup community
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="search-bar" data-aos="fade-up" data-aos-delay="100">
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            placeholder="Search posts, ideas, or people..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      <div className="community-layout">
        {/* Main Feed */}
        <div className="feed-section">
          {/* Tabs & Controls */}
          <div className="feed-controls" data-aos="fade-up">
            <div className="tab-group">
              <button 
                onClick={()=>setTab('all')} 
                className={`tab-btn ${tab==='all' ? 'active' : ''}`}
              >
                <i className="fas fa-globe"></i>
                All Ideas
              </button>
              <button 
                onClick={()=>setTab('my')} 
                className={`tab-btn ${tab==='my' ? 'active' : ''}`}
              >
                <i className="fas fa-user"></i>
                My Posts
              </button>
              <button 
                onClick={()=>setTab('top')} 
                className={`tab-btn ${tab==='top' ? 'active' : ''}`}
              >
                <i className="fas fa-fire"></i>
                Trending
              </button>
            </div>
            
            <div className="sort-group">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Liked</option>
                <option value="discussed">Most Discussed</option>
              </select>
            </div>
          </div>

          {/* Create Post Button */}
          <button 
            className="create-post-btn" 
            onClick={() => toggleComposer(true)}
            data-aos="fade-up"
          >
            <i className="fas fa-plus"></i>
            Share Your Idea
          </button>

          {/* Post Composer */}
          {showComposer && (
            <>
              <div className="composer-overlay" onClick={() => toggleComposer(false)} />
              <div className="composer-card">
                <div className="composer-header">
                  <h3>
                    <i className="fas fa-pen"></i>
                    Create Post
                  </h3>
                  <button onClick={() => toggleComposer(false)} className="close-composer">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <form onSubmit={submitPost}>
                  <textarea 
                    placeholder="Share your startup idea, ask for feedback, or discuss innovation..." 
                    value={content} 
                    onChange={(e)=>setContent(e.target.value)}
                    maxLength={2000}
                    rows={6}
                  />
                  <div className="composer-footer">
                    <div className="char-count">
                      {content.length}/2000
                    </div>
                    <div className="composer-actions">
                      <button type="button" className="btn-secondary" onClick={() => toggleComposer(false)}>
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn-primary" 
                        disabled={!content.trim() || loading || isSubmitting}
                      >
                        {loading || isSubmitting ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Posting...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane"></i>
                            Post
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </>
          )}

          {/* Posts Feed */}
          <div className="posts-feed">
            {loading && posts.length === 0 ? (
              <LoadingSpinner size="large" message="Loading posts..." />
            ) : filteredPosts.length === 0 ? (
              <div className="empty-state">
                <i className="far fa-folder-open"></i>
                <h3>No posts found</h3>
                <p>
                  {searchQuery ? 'Try adjusting your search' : 'Be the first to share an idea!'}
                </p>
              </div>
            ) : (
              filteredPosts.map(p => (
                <PostCard 
                  key={p._id} 
                  post={p} 
                  onLike={toggleLike} 
                  onOpenComments={(post)=>setCommentsFor(post)}
                  isLiked={likedPosts.has(p._id)}
                />
              ))
            )}

            {hasMore && !loading && filteredPosts.length > 0 && (
              <div className="load-more-container" data-aos="fade-up">
                <button onClick={()=>loadFeed(false)} className="btn-load-more">
                  <i className="fas fa-chevron-down"></i>
                  Load More Posts
                </button>
              </div>
            )}
            
            {loading && posts.length > 0 && (
              <LoadingSpinner size="small" />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar-section">

        </div>
      </div>

      {/* Comments Drawer */}
      <Comments postId={commentsFor?._id} open={!!commentsFor} onClose={()=>setCommentsFor(null)} />
      
      {/* Toast Notifications */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}
    </div>
  );
}
