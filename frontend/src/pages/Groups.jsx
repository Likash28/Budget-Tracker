import React, { useEffect, useState } from 'react'
import api from '../services/api.js'
import { useNavigate } from 'react-router-dom'

export default function Groups(){
  const [groups, setGroups] = useState([])
  const [name, setName] = useState('My Group')
  const [members, setMembers] = useState('') // comma sep: userId:name:email
  const [selected, setSelected] = useState(null)
  const [balances, setBalances] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const navigate = useNavigate()
  
  useEffect(()=>{
    const token = localStorage.getItem('jwt')
    console.log("Token value in groups:", token)
    if(!token){
      navigate('/login')
      return
    }
    
    // Get user info from localStorage
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      try {
        setUserInfo(JSON.parse(storedUserInfo))
      } catch (e) {
        console.error('Error parsing stored user info:', e)
      }
    }
  }, [navigate])

  async function load(){
    try {
      setLoading(true)
      const { data } = await api.get('/groups')
      setGroups(data.items || [])
    } catch (error) {
      console.error('Error loading groups:', error)
      setGroups([])
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(()=>{ load() }, [])

  async function createGroup(e){
    e.preventDefault()
    if (!name.trim()) return
    
    setSubmitting(true)
    try {
      const arr = members.split(',').map(s=>{
        const [userId, name, email] = s.split(':').map(t=>t.trim())
        return { userId, name, email }
      }).filter(x=>x.userId && x.name)
      const { data } = await api.post('/groups', { name, members: arr })
      setName(''); setMembers(''); load()
    } catch (error) {
      console.error('Error creating group:', error)
    } finally {
      setSubmitting(false)
    }
  }

  async function viewBalances(id){
    try {
      const { data } = await api.get(`/groups/${id}/balances`)
      setSelected(id)
      setBalances(data)
    } catch (error) {
      console.error('Error loading balances:', error)
      setBalances(null)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getTotalGroups = () => {
    return groups.length
  }

  const getTotalMembers = () => {
    return groups.reduce((sum, group) => sum + (group.members ? group.members.length : 0), 0)
  }

  if (loading) {
    return (
      <div className="groups-container">
        <div className="groups-loading">
          <div className="loading-spinner-large"></div>
          <p>Loading your groups...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="groups-container">
      <div className="groups-content">
        {/* Header Section */}
        <div className="groups-header">
          <div className="header-info">
            <h1>Group Management</h1>
            <p>Create and manage expense sharing groups with friends and family</p>
          </div>
          <div className="summary-cards">
            <div className="summary-card total-groups">
              <div className="card-icon">👥</div>
              <div className="card-content">
                <h3>Total Groups</h3>
                <p className="amount">{getTotalGroups()}</p>
              </div>
            </div>
            <div className="summary-card total-members">
              <div className="card-icon">👤</div>
              <div className="card-content">
                <h3>Total Members</h3>
                <p className="amount">{getTotalMembers()}</p>
              </div>
            </div>
            <div className="summary-card active-groups">
              <div className="card-icon">⚡</div>
              <div className="card-content">
                <h3>Active Groups</h3>
                <p className="amount">{groups.filter(g => g.members && g.members.length > 0).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Group Section */}
        <div className="create-group-section">
          <div className="section-header">
            <h2>Create New Group</h2>
            <p>Start a new expense sharing group</p>
          </div>
          <form onSubmit={createGroup} className="group-form">
            <div className="form-group">
              <label htmlFor="groupName">Group Name</label>
              <input 
                id="groupName"
                placeholder="Enter group name" 
                value={name} 
                onChange={e=>setName(e.target.value)} 
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="members">Members</label>
              <textarea 
                id="members"
                placeholder="Add members in format: userId:name:email, userId2:name2:email2"
                value={members} 
                onChange={e=>setMembers(e.target.value)} 
                className="form-textarea"
                rows="4"
              />
              <div className="form-help">
                <span className="help-icon">💡</span>
                <span>Tip: After seeding, use IDs from users in DB. (Demo group is created by seed.)</span>
              </div>
            </div>
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? (
                <div className="loading-spinner-small"></div>
              ) : (
                <>
                  <span className="btn-icon">➕</span>
                  <span>Create Group</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Groups List Section */}
        <div className="groups-list-section">
          <div className="section-header">
            <h2>Your Groups</h2>
            <p>Manage your expense sharing groups</p>
          </div>
          
          <div className="groups-container-list">
            {groups && groups.length > 0 ? (
              <div className="groups-grid">
                {groups.map(group => (
                  <div key={group._id} className="group-card">
                    <div className="group-card-header">
                      <div className="group-info">
                        <div className="group-icon">👥</div>
                        <div className="group-details">
                          <h3>{group.name}</h3>
                          <p className="member-count">
                            {group.members ? group.members.length : 0} members
                          </p>
                        </div>
                      </div>
                      <div className="group-actions">
                        <button 
                          onClick={()=>viewBalances(group._id)}
                          className="action-btn primary"
                        >
                          <span className="btn-icon">💰</span>
                          <span>View Balances</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="group-members">
                      <h4>Members</h4>
                      <div className="members-list">
                        {group.members && group.members.length > 0 ? (
                          group.members.map((member, index) => (
                            <div key={index} className="member-item">
                              <div className="member-avatar">
                                {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                              </div>
                              <div className="member-info">
                                <span className="member-name">{member.name || 'Unknown'}</span>
                                <span className="member-email">{member.email || 'No email'}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="no-members">
                            <span className="no-members-icon">👤</span>
                            <span>No members added</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-groups">
                <div className="no-groups-icon">👥</div>
                <h3>No Groups Found</h3>
                <p>Create your first group to start sharing expenses</p>
              </div>
            )}
          </div>
        </div>

        {/* Balances Section */}
        {balances && (
          <div className="balances-section">
            <div className="section-header">
              <h2>Group Balances</h2>
              <p>View net balances and settlement suggestions</p>
            </div>
            
            <div className="balances-content">
              <div className="balances-grid">
                <div className="balance-card net-balances">
                  <div className="card-header">
                    <h3>Net Balances</h3>
                    <span className="card-icon">⚖️</span>
                  </div>
                  <div className="balance-list">
                    {balances.net && balances.net.length > 0 ? (
                      balances.net.map(net => (
                        <div key={net.user.userId} className="balance-item">
                          <div className="user-info">
                            <div className="user-avatar">
                              {net.user.name ? net.user.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <span className="user-name">{net.user.name}</span>
                          </div>
                          <div className={`balance-amount ${net.net >= 0 ? 'positive' : 'negative'}`}>
                            {net.net >= 0 ? '+' : ''}{formatCurrency(net.net)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-balances">
                        <span>No balances to display</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="balance-card settlements">
                  <div className="card-header">
                    <h3>Suggested Settlements</h3>
                    <span className="card-icon">💸</span>
                  </div>
                  <div className="settlement-list">
                    {balances.suggestions && balances.suggestions.length > 0 ? (
                      balances.suggestions.map((settlement, index) => (
                        <div key={index} className="settlement-item">
                          <div className="settlement-flow">
                            <div className="from-user">
                              <div className="user-avatar">
                                {settlement.from.name ? settlement.from.name.charAt(0).toUpperCase() : '?'}
                              </div>
                              <span className="user-name">{settlement.from.name}</span>
                            </div>
                            <div className="settlement-arrow">➜</div>
                            <div className="to-user">
                              <div className="user-avatar">
                                {settlement.to.name ? settlement.to.name.charAt(0).toUpperCase() : '?'}
                              </div>
                              <span className="user-name">{settlement.to.name}</span>
                            </div>
                          </div>
                          <div className="settlement-amount">
                            {formatCurrency(settlement.amount)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-settlements">
                        <span>No settlements needed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
