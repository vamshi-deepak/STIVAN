import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/History.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import { API_ENDPOINTS } from '../config/api';
import { getUserData } from '../utils/apiHelper';
import Toast from '../components/Toast/Toast';
import GradientBlinds from '../components/GradientBlinds/GradientBlinds';
import GradientText from '../components/GradientText/GradientText';
import AnimatedButton from '../components/Buttons/AnimatedButton';

const History = () => {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('ideas');
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [chatThreads, setChatThreads] = useState([]);
  const [selectedChatThread, setSelectedChatThread] = useState(null);
  const [scoreFilter, setScoreFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalIdeas: 0,
    averageScore: 0,
    topScore: 0,
    highPerformers: 0,
  });

  const showToast = (type, message) => setToast({ show: true, type, message });

  // Helper function to group chat messages into threads by ideaId
  const groupChatMessagesIntoThreads = (messages) => {
    const threadsMap = new Map();
    
    messages.forEach((msg) => {
      const ideaId = msg.idea || 'general';
      if (!threadsMap.has(ideaId)) {
        threadsMap.set(ideaId, {
          _id: ideaId,
          ideaId: msg.idea ? { _id: msg.idea, title: 'Idea Discussion' } : null,
          messages: [],
          createdAt: msg.createdAt,
          updatedAt: msg.createdAt,
        });
      }
      const thread = threadsMap.get(ideaId);
      thread.messages.push(msg);
      // Update the latest timestamp
      if (new Date(msg.createdAt) > new Date(thread.updatedAt)) {
        thread.updatedAt = msg.createdAt;
      }
    });
    
    return Array.from(threadsMap.values());
  };

  useEffect(() => {
    // helper to determine current logged in user id
    const getCurrentUserId = () => {
      const stored = getUserData();
      if (stored) return stored._id || stored.id || stored.userId || null;
      const token = localStorage.getItem('token');
      if (!token) return null;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId || payload.sub || payload.id || payload._id || null;
      } catch (e) {
        return null;
      }
    };

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch BOTH STIVAN 2.0 ideas AND Vision AI analyses
        const [stivanIdeasResponse, visionAnalysesResponse] = await Promise.all([
          fetch(API_ENDPOINTS.IDEAS.GET_USER_IDEAS, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(API_ENDPOINTS.visionAnalyses, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        
        let allIdeas = [];
        
        // Process STIVAN 2.0 ideas and normalize to a common `analysis` shape
        if (stivanIdeasResponse.ok) {
          const stivanData = await stivanIdeasResponse.json();
          const stivanIdeas = (stivanData.data || []).map(idea => {
            const analysis = idea.analysis || {
              overall_score: idea.score || idea.analysis?.overall_score || 0,
              verdict: idea.verdict || idea.analysis?.verdict || idea.finalVerdict || '',
              breakdown: idea.breakdown || idea.analysis?.breakdown || {},
              suggestions: idea.suggestions || idea.analysis?.suggestions || [],
              detailedAnalysis: idea.detailedAnalysis || idea.analysis?.detailedAnalysis || null
            };
            return {
              ...idea,
              analysis,
              analysisType: 'STIVAN 2.0'
            };
          });
          allIdeas = [...allIdeas, ...stivanIdeas];
        }
        
        // Process Vision AI analyses and normalize to `analysis` shape (with visionAnalysis preserved)
        if (visionAnalysesResponse.ok) {
          const visionData = await visionAnalysesResponse.json();
          const visionIdeas = (visionData.data || []).map(idea => {
            const analysis = idea.analysis || {
              overall_score: idea.score || idea.analysis?.overall_score || 0,
              verdict: idea.verdict || idea.analysis?.verdict || idea.finalVerdict || '',
              breakdown: idea.breakdown || idea.analysis?.breakdown || {},
              suggestions: idea.suggestions || idea.actionableAdvice || idea.analysis?.suggestions || [],
            };
            return {
              ...idea,
              analysis,
              analysisType: 'Vision AI'
            };
          });
          allIdeas = [...allIdeas, ...visionIdeas];
        }
        
        // Only keep ideas that belong to the current user
        const currentUserId = getCurrentUserId();
        if (currentUserId) {
          allIdeas = allIdeas.filter((idea) => {
            const owner = idea.userId || idea.user || idea.createdBy || idea.user_id || idea.owner;
            const ownerId = owner && (typeof owner === 'object' ? (owner._id || owner.id) : owner);
            return ownerId && String(ownerId) === String(currentUserId);
          });
        }

        setIdeas(allIdeas);

        // If a Vision evaluation just returned and saved an openIdeaId, open that idea in the modal
        try {
          const openId = localStorage.getItem('openIdeaId');
          if (openId) {
            const match = allIdeas.find(i => String(i._id) === String(openId));
            if (match) setSelectedIdea(match);
            localStorage.removeItem('openIdeaId');
          }
        } catch (e) {
          // ignore
        }
        
        // Fetch chat history
        const chatsResponse = await fetch(API_ENDPOINTS.CHAT.HISTORY, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (chatsResponse.ok) {
          const chatsData = await chatsResponse.json();
          const chatMessages = chatsData.data || [];
          
          // Group messages into threads and enrich with idea titles
          const threads = groupChatMessagesIntoThreads(chatMessages);
          
          // Enrich threads with actual idea titles
          threads.forEach((thread) => {
            if (thread.ideaId && thread.ideaId._id !== 'general') {
              const matchingIdea = allIdeas.find((idea) => idea._id === thread.ideaId._id);
              if (matchingIdea) {
                thread.ideaId.title = matchingIdea.title;
              }
            }
          });
          
          setChatThreads(threads);
        }
        
        if (!stivanIdeasResponse.ok && !visionAnalysesResponse.ok) {
          showToast('error', 'Failed to load ideas');
        }
      } catch (err) {
        console.error('Error fetching history:', err);
        showToast('error', 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    if (ideas.length > 0) {
      // Handle both STIVAN 2.0 (idea.analysis.overall_score) and Vision AI (idea.score) formats
      const scores = ideas
        .map((idea) => idea.score || idea.analysis?.overall_score || 0)
        .filter((score) => score > 0);
      const totalIdeas = ideas.length;
      const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const topScore = scores.length > 0 ? Math.max(...scores) : 0;
      const highPerformers = scores.filter((score) => score >= 70).length;
      setStats({ totalIdeas, averageScore, topScore, highPerformers });
    }
  }, [ideas]);

  const getFilteredIdeas = () => {
    let filtered = [...ideas];
    
    // Handle both STIVAN 2.0 (idea.analysis.overall_score) and Vision AI (idea.score) formats
    if (scoreFilter === 'high') {
      filtered = filtered.filter((idea) => {
        const score = idea.score || idea.analysis?.overall_score || 0;
        return score >= 70;
      });
    } else if (scoreFilter === 'medium') {
      filtered = filtered.filter((idea) => {
        const score = idea.score || idea.analysis?.overall_score || 0;
        return score >= 50 && score < 70;
      });
    } else if (scoreFilter === 'low') {
      filtered = filtered.filter((idea) => {
        const score = idea.score || idea.analysis?.overall_score || 0;
        return score < 50;
      });
    }
    
    if (searchQuery) {
      filtered = filtered.filter((idea) =>
        idea.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'highScore') {
      filtered.sort((a, b) => {
        const scoreA = a.score || a.analysis?.overall_score || 0;
        const scoreB = b.score || b.analysis?.overall_score || 0;
        return scoreB - scoreA;
      });
    } else if (sortBy === 'lowScore') {
      filtered.sort((a, b) => {
        const scoreA = a.score || a.analysis?.overall_score || 0;
        const scoreB = b.score || b.analysis?.overall_score || 0;
        return scoreA - scoreB;
      });
    }
    return filtered;
  };

  const filteredIdeas = getFilteredIdeas();

  const getScoreColor = (score) => {
    if (score >= 70) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreBadge = (score) => {
    if (score >= 70) return { text: 'High Potential', icon: 'fa-rocket' };
    if (score >= 50) return { text: 'Promising', icon: 'fa-star' };
    return { text: 'Needs Work', icon: 'fa-tools' };
  };

  // Refresh function to reload all data
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch BOTH STIVAN 2.0 ideas AND Vision AI analyses
      const [stivanIdeasResponse, visionAnalysesResponse] = await Promise.all([
        fetch(API_ENDPOINTS.IDEAS.GET_USER_IDEAS, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(API_ENDPOINTS.visionAnalyses, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      
      let allIdeas = [];
      
      // Process STIVAN 2.0 ideas
      if (stivanIdeasResponse.ok) {
        const stivanData = await stivanIdeasResponse.json();
        const stivanIdeas = (stivanData.data || []).map(idea => {
          const analysis = idea.analysis || {
            overall_score: idea.score || idea.analysis?.overall_score || 0,
            verdict: idea.verdict || idea.analysis?.verdict || idea.finalVerdict || '',
            breakdown: idea.breakdown || idea.analysis?.breakdown || {},
            suggestions: idea.suggestions || idea.analysis?.suggestions || [],
          };
          return { ...idea, analysis, analysisType: 'STIVAN 2.0' };
        });
        allIdeas = [...allIdeas, ...stivanIdeas];
      }
      
      // Process Vision AI analyses
      if (visionAnalysesResponse.ok) {
        const visionData = await visionAnalysesResponse.json();
        const visionIdeas = (visionData.data || []).map(idea => {
          const analysis = idea.analysis || {
            overall_score: idea.score || idea.analysis?.overall_score || 0,
            verdict: idea.verdict || idea.analysis?.verdict || idea.finalVerdict || '',
            breakdown: idea.breakdown || idea.analysis?.breakdown || {},
            suggestions: idea.suggestions || idea.actionableAdvice || idea.analysis?.suggestions || [],
          };
          return { ...idea, analysis, analysisType: 'Vision AI' };
        });
        allIdeas = [...allIdeas, ...visionIdeas];
      }
      
      setIdeas(allIdeas);
      // Filter by current user when refreshing as well
      try {
        const currentUserId = (function() {
          const stored = getUserData();
          if (stored) return stored._id || stored.id || stored.userId || null;
          const token = localStorage.getItem('token');
          if (!token) return null;
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.userId || payload.sub || payload.id || payload._id || null;
          } catch (e) {
            return null;
          }
        })();
        if (currentUserId) {
          allIdeas = allIdeas.filter((idea) => {
            const owner = idea.userId || idea.user || idea.createdBy || idea.user_id || idea.owner;
            const ownerId = owner && (typeof owner === 'object' ? (owner._id || owner.id) : owner);
            return ownerId && String(ownerId) === String(currentUserId);
          });
          setIdeas(allIdeas);
        }
      } catch (e) {
        // if anything fails, fall back to original allIdeas
      }
      
      // Fetch chat history
      const chatsResponse = await fetch(API_ENDPOINTS.CHAT.HISTORY, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (chatsResponse.ok) {
        const chatsData = await chatsResponse.json();
        const chatMessages = chatsData.data || [];
        const threads = groupChatMessagesIntoThreads(chatMessages);
        
        threads.forEach((thread) => {
          if (thread.ideaId && thread.ideaId._id !== 'general') {
            const matchingIdea = allIdeas.find((idea) => idea._id === thread.ideaId._id);
            if (matchingIdea) {
              thread.ideaId.title = matchingIdea.title;
            }
          }
        });
        
        setChatThreads(threads);
      }
      showToast('success', 'History refreshed successfully');
    } catch (err) {
      console.error('Error refreshing history:', err);
      showToast('error', 'Failed to refresh history');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = async (ideaId) => {
    if (!window.confirm('Are you sure you want to delete this idea?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.IDEAS.DELETE}/${ideaId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        setIdeas(ideas.filter((idea) => idea._id !== ideaId));
        showToast('success', 'Idea deleted successfully');
        setSelectedIdea(null);
      } else {
        showToast('error', 'Failed to delete idea');
      }
    } catch (err) {
      console.error('Error deleting idea:', err);
      showToast('error', 'Failed to delete idea');
    }
  };

  // UPDATED: Fetch full idea from server and open modal with normalized vision data
  const handleOpenDetails = async (idea) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.ideaById(idea._id), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const full = data.data || data;
        
        // Normalize the vision analysis data
        const visionAnalysis = full.visionAnalysis ? {
          ...full.visionAnalysis,
          competitors: full.visionAnalysis.competitors?.map(comp => 
            typeof comp === 'object' ? comp.name || comp.title || JSON.stringify(comp) : comp
          ),
          categoryTags: full.visionAnalysis.categoryTags?.map(tag => 
            typeof tag === 'object' ? tag.name || tag.value || JSON.stringify(tag) : tag
          ),
          domain: typeof full.visionAnalysis.domain === 'object' 
            ? full.visionAnalysis.domain.name || full.visionAnalysis.domain.value 
            : full.visionAnalysis.domain
        } : null;
        
        // Normalize analysis fields
        const analysis = full.analysis || {
          overall_score: full.score || full.analysis?.overall_score || 0,
          verdict: full.verdict || full.analysis?.verdict || full.finalVerdict || '',
          breakdown: full.breakdown || full.analysis?.breakdown || {},
          suggestions: full.suggestions || full.actionableAdvice || full.analysis?.suggestions || [],
        };
        
        setSelectedIdea({ 
          ...full, 
          visionAnalysis,
          analysis 
        });
      } else {
        // Fallback to local idea if fetch fails
        setSelectedIdea(idea);
      }
    } catch (err) {
      console.error('Failed to fetch idea details:', err);
      setSelectedIdea(idea);
    }
  };

  // Clear all ideas belonging to the current user
  const handleClearIdeas = async () => {
    if (!window.confirm('Are you sure you want to delete ALL your ideas? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.IDEAS.CLEAR, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setIdeas([]);
        showToast('success', 'All ideas cleared');
      } else {
        showToast('error', 'Failed to clear ideas');
      }
    } catch (err) {
      console.error('Error clearing ideas:', err);
      showToast('error', 'Failed to clear ideas');
    }
  };

  // Clear all chat messages for the current user
  const handleClearChats = async () => {
    if (!window.confirm('Are you sure you want to delete ALL your chats? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.CHAT.CLEAR || API_ENDPOINTS.chatClear || API_ENDPOINTS.CHAT_CLEAR, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res && res.ok) {
        setChatThreads([]);
        showToast('success', 'All chats cleared');
        setSelectedChatThread(null);
      } else {
        showToast('error', 'Failed to clear chats');
      }
    } catch (err) {
      console.error('Error clearing chats:', err);
      showToast('error', 'Failed to clear chats');
    }
  };

  return (
    <div className="history-page-wrapper">
      <div className="history-hero-section">
        <div className="history-hero-background">
          <GradientBlinds gradientColors={['#667eea', '#764ba2', '#f093fb']} angle={45} blindCount={12} noise={0.25} mixBlendMode="normal" />
        </div>
        <div className="history-hero-content">
          <h1 className="history-hero-title">
            <GradientText colors={['#ffffff', '#a78bfa', '#c084fc']}>YOUR JOURNEY</GradientText>
          </h1>
          <p className="history-hero-subtitle"><i className="fas fa-history"></i>Track your ideas and conversations</p>
        </div>
      </div>

      <div className="history-stats-section">
        <div className="history-stats-grid">
          <div className="history-stat-card" data-color="purple">
            <div className="stat-card-icon"><i className="fas fa-lightbulb"></i></div>
            <div className="stat-card-content"><div className="stat-card-value">{stats.totalIdeas}</div><div className="stat-card-label">Total Ideas</div></div>
            <div className="stat-card-glow"></div>
          </div>
          <div className="history-stat-card" data-color="blue">
            <div className="stat-card-icon"><i className="fas fa-chart-line"></i></div>
            <div className="stat-card-content"><div className="stat-card-value">{stats.averageScore}</div><div className="stat-card-label">Avg Score</div></div>
            <div className="stat-card-glow"></div>
          </div>
          <div className="history-stat-card" data-color="green">
            <div className="stat-card-icon"><i className="fas fa-trophy"></i></div>
            <div className="stat-card-content"><div className="stat-card-value">{stats.topScore}</div><div className="stat-card-label">Top Score</div></div>
            <div className="stat-card-glow"></div>
          </div>
          <div className="history-stat-card" data-color="orange">
            <div className="stat-card-icon"><i className="fas fa-fire"></i></div>
            <div className="stat-card-content"><div className="stat-card-value">{stats.highPerformers}</div><div className="stat-card-label">High Performers</div></div>
            <div className="stat-card-glow"></div>
          </div>
        </div>
      </div>

      <div className="history-controls-section">
        <div className="history-controls-container">
          <div className="control-group-new">
            <label className="control-label-new"><i className="fas fa-eye"></i>View</label>
            <div className="view-mode-toggle">
              <button className={`view-mode-btn ${viewMode === 'ideas' ? 'active' : ''}`} onClick={() => setViewMode('ideas')}><i className="fas fa-lightbulb"></i>Ideas</button>
              <button className={`view-mode-btn ${viewMode === 'chats' ? 'active' : ''}`} onClick={() => setViewMode('chats')}><i className="fas fa-comments"></i>Chats</button>
              <div className="toggle-indicator"></div>
            </div>
          </div>
          {viewMode === 'ideas' && (<>
            <div className="control-group-new">
              <label className="control-label-new"><i className="fas fa-filter"></i>Score</label>
              <select className="control-select-new" value={scoreFilter} onChange={(e) => setScoreFilter(e.target.value)}>
                <option value="all">All Scores</option>
                <option value="high">High (70+)</option>
                <option value="medium">Medium (50-69)</option>
                <option value="low">Low (&lt;50)</option>
              </select>
            </div>
            <div className="control-group-new">
              <label className="control-label-new"><i className="fas fa-sort"></i>Sort</label>
              <select className="control-select-new" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="highScore">Highest Score</option>
                <option value="lowScore">Lowest Score</option>
              </select>
            </div>
            <div className="control-group-new">
              <label className="control-label-new"><i className="fas fa-trash-alt"></i>Clear</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button className="control-action-btn" onClick={handleClearIdeas} title="Delete all your ideas"><i className="fas fa-trash"></i> Clear Ideas</button>
                <button className="control-action-btn" onClick={handleClearChats} title="Delete all your chats"><i className="fas fa-trash-restore"></i> Clear Chats</button>
              </div>
            </div>
          </>)}
          <div className="search-group-new">
            <div className="search-bar-new">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Search ideas..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              {searchQuery && (<button className="search-clear" onClick={() => setSearchQuery('')}><i className="fas fa-times"></i></button>)}
            </div>
          </div>
          <button 
            className="refresh-btn-new" 
            onClick={handleRefresh} 
            disabled={refreshing}
            title="Refresh history"
          >
            <i className={`fas fa-sync-alt ${refreshing ? 'fa-spin' : ''}`}></i>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="history-content-section">
        {loading ? (
          <div className="loading-state-new"><div className="loading-spinner-new"><i className="fas fa-spinner"></i></div><p>Loading your history...</p></div>
        ) : (<>
          {viewMode === 'ideas' ? (filteredIdeas.length === 0 ? (
            <div className="empty-state-new">
              <div className="empty-state-content">
                <div className="empty-icon"><i className="fas fa-lightbulb"></i></div>
                <h3 className="empty-title">No Ideas Yet</h3>
                <p className="empty-description">{searchQuery || scoreFilter !== 'all' ? 'No ideas match your filters. Try adjusting your search criteria.' : 'Start your journey by validating your first idea!'}</p>
                {!searchQuery && scoreFilter === 'all' && (<AnimatedButton onClick={() => navigate('/chat')} variant="primary"><i className="fas fa-plus"></i> Validate New Idea</AnimatedButton>)}
              </div>
            </div>
          ) : (
            <div className="ideas-grid-new">
              {filteredIdeas.map((idea) => {
                // Handle both STIVAN 2.0 (idea.analysis.overall_score) and Vision AI (idea.score) formats
                const score = idea.score || idea.analysis?.overall_score || 0;
                const scoreColor = getScoreColor(score);
                const scoreBadge = getScoreBadge(score);
                const verdict = idea.verdict || idea.analysis?.verdict || 'Pending';
                const analysisType = idea.analysisType || 'Unknown';
                
                return (
                  <div key={idea._id} className="idea-card-new">
                    <div className="card-glow-effect"></div>
                    <div className="idea-card-header-new">
                      <h3 className="idea-card-title-new">{idea.title}</h3>
                      <div className="idea-card-actions-new">
                        <button className="idea-action-btn chat" onClick={() => navigate(`/chat?ideaId=${idea._id}`)} title="Continue chatting"><i className="fas fa-comments"></i></button>
                        <button className="idea-action-btn delete" onClick={() => handleDelete(idea._id)} title="Delete idea"><i className="fas fa-trash"></i></button>
                      </div>
                    </div>
                    <div className="score-badge-container">
                      <div className="score-badge-new" style={{ borderColor: scoreColor }}>
                        <div className="score-value" style={{ color: scoreColor }}>{score}</div>
                        <div className="score-label">Score</div>
                      </div>
                      <div className="score-status" style={{ color: scoreColor }}><i className={`fas ${scoreBadge.icon}`}></i>{scoreBadge.text}</div>
                    </div>
                    <div className="verdict-pill" style={{ borderColor: scoreColor, color: scoreColor, background: `${scoreColor}20` }}>
                      <i className="fas fa-check-circle"></i>{verdict}
                    </div>
                    <div className="analysis-type-badge" style={{ 
                      background: analysisType === 'Vision AI' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      color: '#fff',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      marginTop: '8px',
                      display: 'inline-block'
                    }}>
                      <i className={`fas ${analysisType === 'Vision AI' ? 'fa-eye' : 'fa-brain'}`}></i> {analysisType}
                    </div>
                    <div className="idea-card-meta-new">
                      <div className="meta-item-new"><i className="fas fa-calendar"></i>{new Date(idea.createdAt).toLocaleDateString()}</div>
                      <div className="meta-item-new"><i className="fas fa-clock"></i>{new Date(idea.createdAt).toLocaleTimeString()}</div>
                    </div>
                    {idea.description && (() => {
                      const desc = String(idea.description || '');
                      return (<p className="idea-preview-text">{desc.length > 120 ? `${desc.slice(0, 120)}...` : desc}</p>);
                    })()}
                    <div className="idea-card-footer-new"><button className="view-details-btn" onClick={() => handleOpenDetails(idea)}><i className="fas fa-eye"></i>View Details</button></div>
                  </div>
                );
              })}
            </div>
          )) : chatThreads.length === 0 ? (
            <div className="empty-state-new">
              <div className="empty-state-content">
                <div className="empty-icon"><i className="fas fa-comments"></i></div>
                <h3 className="empty-title">No Chat Threads</h3>
                <p className="empty-description">Start a conversation with our AI to validate your ideas!</p>
                <AnimatedButton onClick={() => navigate('/chat')} variant="primary"><i className="fas fa-comments"></i> Start Chatting</AnimatedButton>
              </div>
            </div>
          ) : (
            <div className="ideas-grid-new">
              {chatThreads.map((thread) => (
                <div key={thread._id} className="chat-card-new">
                  <div className="chat-card-header">
                    <div className="chat-card-icon"><i className="fas fa-comments"></i></div>
                    <h3 className="chat-card-title">{thread.ideaId?.title || 'General Chat'}</h3>
                    <div style={{ marginLeft: 'auto' }}>
                      <button className="chat-delete-btn" title="Delete this thread" onClick={async () => {
                        if (!window.confirm('Delete this chat thread? This will remove messages for this idea.')) return;
                        try {
                          const token = localStorage.getItem('token');
                          const idParam = thread._id === 'general' ? '' : `?ideaId=${thread._id}`;
                          const res = await fetch(`${API_ENDPOINTS.CHAT.CLEAR || API_ENDPOINTS.chatClear || API_ENDPOINTS.CHAT_CLEAR}${idParam}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          if (res.ok) {
                            setChatThreads((prev) => prev.filter((t) => t._id !== thread._id));
                            if (selectedChatThread && selectedChatThread._id === thread._id) setSelectedChatThread(null);
                            showToast('success', 'Chat thread deleted');
                          } else {
                            showToast('error', 'Failed to delete chat thread');
                          }
                        } catch (err) {
                          console.error('Error deleting chat thread:', err);
                          showToast('error', 'Failed to delete chat thread');
                        }
                      }}><i className="fas fa-trash"></i></button>
                    </div>
                  </div>
                  <div className="chat-card-info">
                    <div className="chat-info-item"><i className="fas fa-message"></i>{thread.messages?.length || 0} messages</div>
                    <div className="chat-info-item"><i className="fas fa-calendar"></i>{new Date(thread.createdAt).toLocaleDateString()}</div>
                  </div>
                  {thread.messages && thread.messages.length > 0 && (() => {
                    const last = thread.messages[thread.messages.length - 1] || {};
                    const text = String(last.text || last.content || last.message || '');
                    return (<p className="chat-card-preview">{text.length > 100 ? `${text.slice(0, 100)}...` : text}</p>);
                  })()}
                  <div className="chat-card-footer"><button className="view-chat-btn" onClick={() => setSelectedChatThread(thread)}><i className="fas fa-eye"></i>View Thread</button></div>
                </div>
              ))}
            </div>
          )}
        </>)}
      </div>

      {selectedIdea && (
        <div className="modal-overlay-new" onClick={() => setSelectedIdea(null)}>
          <div className="modal-container-new" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-new" onClick={() => setSelectedIdea(null)}><i className="fas fa-times"></i></button>
            <div className="modal-content-new">
              <div className="modal-header-new">
                <h2 className="modal-title-new">{selectedIdea.title}</h2>
                <div className="modal-actions-new"><button className="modal-delete-btn" onClick={() => { handleDelete(selectedIdea._id); }}><i className="fas fa-trash"></i>Delete</button></div>
              </div>
              {selectedIdea.analysis && (
                <div className="modal-score-section-new">
                    <div className="modal-score-display">
                    <div className="modal-score-circle">
                      <svg width="180" height="180" viewBox="0 0 180 180">
                        <circle cx="90" cy="90" r="70" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                        <circle cx="90" cy="90" r="70" fill="none" stroke={getScoreColor(selectedIdea.analysis.overall_score)} strokeWidth="12" strokeDasharray={`${(selectedIdea.analysis.overall_score / 100) * 440} 440`} strokeLinecap="round" transform="rotate(-90 90 90)" style={{ transition: 'stroke-dasharray 1s ease' }} />
                      </svg>
                      <div className="modal-score-text"><span className="modal-score-number">{selectedIdea.analysis.overall_score}</span><span className="modal-score-max">/100</span></div>
                    </div>
                    <div className="modal-verdict-badge" style={{ borderColor: getScoreColor(selectedIdea.analysis.overall_score), color: getScoreColor(selectedIdea.analysis.overall_score), background: `${getScoreColor(selectedIdea.analysis.overall_score)}20` }}><i className={`fas ${getScoreBadge(selectedIdea.analysis.overall_score).icon}`}></i>{selectedIdea.analysis.verdict}</div>
                  </div>
                </div>
              )}
              {selectedIdea.analysis?.breakdown && (
                <div className="modal-section-new">
                  <h3 className="modal-section-title-new"><i className="fas fa-chart-pie"></i>Score Breakdown</h3>
                  <div className="breakdown-grid-new">
                    {Object.entries(selectedIdea.analysis.breakdown).map(([key, value]) => {
                      const score = typeof value === 'object' ? value.score : value;
                      const color = getScoreColor(score * 10);
                      return (
                        <div key={key} className="breakdown-item-new">
                          <div className="breakdown-header-new">
                            <span className="breakdown-name">{key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</span>
                            <span className="breakdown-score" style={{ color }}>{score}/10</span>
                          </div>
                          <div className="breakdown-bar-wrapper"><div className="breakdown-bar-fill-new" style={{ width: `${(score / 10) * 100}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)` }}></div></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {selectedIdea.analysis?.suggestions && selectedIdea.analysis.suggestions.length > 0 && (
                <div className="modal-section-new">
                  <h3 className="modal-section-title-new"><i className="fas fa-lightbulb"></i>Suggestions</h3>
                  <div className="suggestions-list-new">
                    {selectedIdea.analysis.suggestions.map((suggestion, index) => (
                      <div key={index} className="suggestion-item-new">
                        <div className="suggestion-icon"><i className="fas fa-check"></i></div>
                        <p className="suggestion-text">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedIdea.description && (
                <div className="modal-section-new">
                  <h3 className="modal-section-title-new"><i className="fas fa-align-left"></i>Description</h3>
                  <p className="modal-description-text">{selectedIdea.description}</p>
                </div>
              )}
              {selectedIdea.visionAnalysis && (
                <div className="modal-section-new">
                  <h3 className="modal-section-title-new"><i className="fas fa-eye"></i>Vision Analysis</h3>
                  <div className="vision-grid-new">
                    <div className="vision-row-new"><strong>Analyst:</strong> {selectedIdea.visionAnalysis.analyst || selectedIdea.visionAnalysis.author || 'Analyst Zero'}</div>
                    <div className="vision-row-new"><strong>Analyzed At:</strong> {(() => { try { return selectedIdea.visionAnalysis.analysisTimestamp ? new Date(selectedIdea.visionAnalysis.analysisTimestamp).toLocaleString() : (selectedIdea.visionAnalysis.timestamp ? new Date(selectedIdea.visionAnalysis.timestamp).toLocaleString() : '') } catch (e) { return '' } })()}</div>
                    {selectedIdea.visionAnalysis.domain && (<div className="vision-row-new"><strong>Domain:</strong> {selectedIdea.visionAnalysis.domain}</div>)}
                    {selectedIdea.visionAnalysis.categoryTags && selectedIdea.visionAnalysis.categoryTags.length > 0 && (<div className="vision-row-new"><strong>Categories:</strong> {selectedIdea.visionAnalysis.categoryTags.join(', ')}</div>)}
                    {selectedIdea.visionAnalysis.competitors && selectedIdea.visionAnalysis.competitors.length > 0 && (
                      <div className="vision-row-new">
                        <strong>Competitors:</strong> {selectedIdea.visionAnalysis.competitors.map(competitor => 
                          typeof competitor === 'object' ? competitor.name || competitor.title || JSON.stringify(competitor) : competitor
                        ).join(', ')}
                      </div>
                    )}
                    {selectedIdea.visionAnalysis.market_intelligence && (
                      <div className="vision-row-new"><strong>Market Intelligence:</strong> <div className="vision-block-text">{selectedIdea.visionAnalysis.market_intelligence}</div></div>
                    )}
                    {selectedIdea.visionAnalysis.verdictReasoning && (
                      <div className="vision-row-new"><strong>Verdict / Reasoning:</strong> <div className="vision-block-text">{selectedIdea.visionAnalysis.verdictReasoning}</div></div>
                    )}
                    {selectedIdea.visionAnalysis.scores && Object.keys(selectedIdea.visionAnalysis.scores).length > 0 && (
                      <div className="vision-scores-new">
                        <h4 className="modal-subtitle-new"><i className="fas fa-chart-line"></i>Vision Scores</h4>
                        <div className="breakdown-grid-new">
                          {Object.entries(selectedIdea.visionAnalysis.scores).map(([k, v]) => {
                            const val = typeof v === 'object' && v.score !== undefined ? v.score : v;
                            const pct = Number(val) || 0;
                            const color = getScoreColor(pct);
                            return (
                              <div key={k} className="breakdown-item-new">
                                <div className="breakdown-header-new">
                                  <span className="breakdown-name">{k.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</span>
                                  <span className="breakdown-score" style={{ color }}>{pct}</span>
                                </div>
                                <div className="breakdown-bar-wrapper"><div className="breakdown-bar-fill-new" style={{ width: `${Math.min(100, (pct / 100) * 100)}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)` }}></div></div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {((selectedIdea.visionAnalysis.actionableAdvice && selectedIdea.visionAnalysis.actionableAdvice.length > 0) || (selectedIdea.visionAnalysis.suggestions && selectedIdea.visionAnalysis.suggestions.length > 0)) && (
                      <div className="modal-section-new">
                        <h3 className="modal-section-title-new"><i className="fas fa-lightbulb"></i>Vision Suggestions</h3>
                        <div className="suggestions-list-new">
                          {(selectedIdea.visionAnalysis.actionableAdvice || selectedIdea.visionAnalysis.suggestions || []).map((s, i) => (
                            <div key={i} className="suggestion-item-new">
                              <div className="suggestion-icon"><i className="fas fa-check"></i></div>
                              <p className="suggestion-text">{s}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="modal-section-new">
                <h3 className="modal-section-title-new"><i className="fas fa-info-circle"></i>Information</h3>
                <div className="metadata-grid-new">
                  <div className="metadata-item-new"><div className="metadata-label-new">Created</div><div className="metadata-value-new">{new Date(selectedIdea.createdAt).toLocaleString()}</div></div>
                  <div className="metadata-item-new"><div className="metadata-label-new">Last Updated</div><div className="metadata-value-new">{new Date(selectedIdea.updatedAt).toLocaleString()}</div></div>
                  <div className="metadata-item-new"><div className="metadata-label-new">Status</div><div className="metadata-value-new">{selectedIdea.status || 'Active'}</div></div>
                  <div className="metadata-item-new"><div className="metadata-label-new">ID</div><div className="metadata-value-new">{selectedIdea._id?.substring(0, 8)}...</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedChatThread && (
        <div className="modal-overlay-new" onClick={() => setSelectedChatThread(null)}>
          <div className="modal-container-new" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-new" onClick={() => setSelectedChatThread(null)}><i className="fas fa-times"></i></button>
            <div className="modal-content-new">
              <div className="modal-header-new"><h2 className="modal-title-new">{selectedChatThread.ideaId?.title || 'Chat Thread'}</h2></div>
              <div className="modal-section-new">
                <h3 className="modal-section-title-new"><i className="fas fa-comments"></i>Messages</h3>
                <div className="chat-messages-container">
                  {selectedChatThread.messages?.map((message, index) => (
                    <div key={index} className={`chat-message-new ${message.role === 'user' ? 'user' : 'assistant'}`}>
                      <div className="message-avatar-new"><i className={`fas ${message.role === 'user' ? 'fa-user' : 'fa-robot'}`}></i></div>
                      <div className="message-bubble">
                        <div className="message-bubble-header">
                          <span className="message-sender">{message.role === 'user' ? 'You' : 'STIVAN AI'}</span>
                          <span className="message-timestamp">{(() => {
                            const t = message.timestamp || message.createdAt || message.created_at;
                            try { return t ? new Date(t).toLocaleString() : '' } catch (e) { return '' }
                          })()}</span>
                        </div>
                        <div className="message-bubble-text">{(() => {
                          const content = String(message.text || message.content || message.message || '');
                          return content;
                        })()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-section-new">
                <div className="metadata-grid-new">
                  <div className="metadata-item-new"><div className="metadata-label-new">Total Messages</div><div className="metadata-value-new">{selectedChatThread.messages?.length || 0}</div></div>
                  <div className="metadata-item-new"><div className="metadata-label-new">Started</div><div className="metadata-value-new">{new Date(selectedChatThread.createdAt).toLocaleString()}</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}
    </div>
  );
};

export default History;