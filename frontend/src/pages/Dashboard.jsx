import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api.js'

export default function Dashboard(){
  const [summary, setSummary] = useState({ income:0, expense:0, savings:0, categories:[] })
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7))
  const [loading, setLoading] = useState(true)
  const [recentTransactions, setRecentTransactions] = useState([])
  const [userInfo, setUserInfo] = useState(null)
  const navigate = useNavigate()

  useEffect(()=>{
    const token = localStorage.getItem('jwt')
    console.log("Token value in dashboard:", token)
    if(!token){
      navigate('/login')
      return
    }
    
    // Try to get user info from localStorage first
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      try {
        setUserInfo(JSON.parse(storedUserInfo))
      } catch (e) {
        console.error('Error parsing stored user info:', e)
      }
    }
  }, [navigate])

  useEffect(()=>{
    const token = localStorage.getItem('jwt')
    if(token){
      setLoading(true)
      Promise.all([
        api.get('/reports/summary', { params: { month }}).then(({data})=> setSummary(data)),
        api.get('/transactions?limit=5').then(({data})=> setRecentTransactions(data.items || [])),
        api.get('/auth/me').then(({data})=> {
          console.log('User info from API:', data)
          setUserInfo(data)
        }).catch((error) => {
          console.error('Error fetching user info:', error)
          // Fallback: try to get user info from token
          try {
            const tokenData = JSON.parse(atob(token.split('.')[1]))
            setUserInfo({ name: 'User', id: tokenData.sub })
          } catch (e) {
            console.error('Error parsing token:', e)
          }
        })
      ]).catch((error)=>{
        console.error('Error fetching dashboard data:', error)
      }).finally(() => {
        setLoading(false)
      })
    }
  }, [month])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const getSavingsPercentage = () => {
    if (summary.income === 0) return 0
    return ((summary.savings / summary.income) * 100).toFixed(1)
  }

  const getExpensePercentage = () => {
    if (summary.income === 0) return 0
    return ((summary.expense / summary.income) * 100).toFixed(1)
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <div className="loading-spinner-large"></div>
          <p>Loading your financial overview...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header Section */}
        <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="welcome-title">
            {getGreeting()}, {userInfo?.name || 'User'}! 👋
          </h1>
          <p className="welcome-subtitle">
            Welcome back{userInfo?.name ? `, ${userInfo.name.split(' ')[0]}` : ''}! Here's your financial overview for {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="month-selector-container">
          <label className="month-label">Select Month:</label>
          <input 
            type="month" 
            value={month} 
            onChange={e=>setMonth(e.target.value)}
            className="month-selector-input"
          />
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="financial-overview">
        <div className="overview-card income-card">
          <div className="card-header">
            <div className="card-icon income-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="card-title">
              <h3>Total Income</h3>
              <p>This month's earnings</p>
            </div>
          </div>
          <div className="card-amount">{formatCurrency(summary.income || 0)}</div>
          <div className="card-trend positive">
            <span className="trend-icon">📈</span>
            <span>+12.5% from last month</span>
          </div>
        </div>

        <div className="overview-card expense-card">
          <div className="card-header">
            <div className="card-icon expense-icon">💸</div>
            <div className="card-title">
              <h3>Total Expenses</h3>
              <p>Money spent this month</p>
            </div>
          </div>
          <div className="card-amount">{formatCurrency(summary.expense || 0)}</div>
          <div className="card-trend negative">
            <span className="trend-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM7 10H9V16H7V10ZM11 6H13V16H11V6ZM15 8H17V16H15V8Z" fill="currentColor"/>
              </svg>
            </span>
            <span>{getExpensePercentage()}% of income</span>
          </div>
        </div>

        <div className="overview-card savings-card">
          <div className="card-header">
            <div className="card-icon savings-icon">💎</div>
            <div className="card-title">
              <h3>Net Savings</h3>
              <p>Money saved this month</p>
            </div>
          </div>
          <div className="card-amount">{formatCurrency(summary.savings || 0)}</div>
          <div className="card-trend positive">
            <span className="trend-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z" fill="currentColor"/>
              </svg>
            </span>
            <span>{getSavingsPercentage()}% savings rate</span>
          </div>
        </div>
      </div>

      {/* Charts and Analytics Section */}
      <div className="analytics-section">
        <div className="chart-container">
          <div className="chart-header">
            <h3>Spending by Category</h3>
            <p>Breakdown of your expenses</p>
          </div>
          <div className="category-chart">
            {summary.categories && summary.categories.length > 0 ? (
              <div className="category-bars">
                {summary.categories.slice(0, 6).map((category, index) => {
                  const maxAmount = Math.max(...summary.categories.map(c => c.total))
                  const percentage = (category.total / maxAmount) * 100
                  return (
                    <div key={category.category} className="category-bar-item">
                      <div className="category-info">
                        <span className="category-name">{category.category}</span>
                        <span className="category-amount">{formatCurrency(category.total)}</span>
                      </div>
                      <div className="bar-container">
                        <div 
                          className="category-bar"
                          style={{ 
                            width: `${percentage}%`,
                            background: `linear-gradient(90deg, var(--accent-blue), var(--accent-purple))`
                          }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="no-data">
                <div className="no-data-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM7 10H9V16H7V10ZM11 6H13V16H11V6ZM15 8H17V16H15V8Z" fill="currentColor"/>
                  </svg>
                </div>
                <p>No spending data available for this month</p>
              </div>
            )}
          </div>
        </div>

        <div className="recent-transactions">
          <div className="transactions-header">
            <h3>Recent Transactions</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="transactions-list">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-icon">
                    {transaction.type === 'income' ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20ZM12 6C9.79 6 8 7.79 8 10S9.79 14 12 14 16 12.21 16 10 14.21 6 12 6ZM12 12C10.9 12 10 11.1 10 10S10.9 8 12 8 14 8.9 14 10 13.1 12 12 12Z" fill="currentColor"/>
                      </svg>
                    )}
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-description">{transaction.description}</div>
                    <div className="transaction-category">{transaction.category}</div>
                  </div>
                  <div className={`transaction-amount ${transaction.type}`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-transactions">
                <div className="no-transactions-icon">📝</div>
                <p>No recent transactions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <Link to="/transactions" className="action-btn primary">
            <span className="btn-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V8H20V18ZM20 6H4V6H20V6Z" fill="currentColor"/>
              </svg>
            </span>
            <span>Transactions</span>
          </Link>
          <Link to="/budgets" className="action-btn secondary">
            <span className="btn-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z" fill="currentColor"/>
              </svg>
            </span>
            <span>Budgets</span>
          </Link>
          <Link to="/groups" className="action-btn secondary">
            <span className="btn-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 4C18.21 4 20 5.79 20 8S18.21 12 16 12 12 10.21 12 8 13.79 4 16 4ZM16 10C17.1 10 18 9.1 18 8S17.1 6 16 6 14 6.9 14 8 14.9 10 16 10ZM8 4C10.21 4 12 5.79 12 8S10.21 12 8 12 4 10.21 4 8 5.79 4 8 4ZM8 10C9.1 10 10 9.1 10 8S9.1 6 8 6 6 6.9 6 8 6.9 10 8 10ZM8 14C5.33 14 0 15.34 0 18V20H2V18C2 16.45 4.42 15 8 15S14 16.45 14 18V20H16V18C16 15.34 10.67 14 8 14ZM16 14C13.33 14 8 15.34 8 18V20H24V18C24 15.34 18.67 14 16 14Z" fill="currentColor"/>
              </svg>
            </span>
            <span>Groups</span>
          </Link>
          <Link to="/reports" className="action-btn secondary">
            <span className="btn-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM7 10H9V16H7V10ZM11 6H13V16H11V6ZM15 8H17V16H15V8Z" fill="currentColor"/>
              </svg>
            </span>
            <span>Reports</span>
          </Link>
        </div>
      </div>

      {/* Financial Health Score */}
      <div className="financial-health">
        <div className="health-card">
          <div className="health-header">
            <h3>Financial Health Score</h3>
            <div className="health-score">
              <span className="score-number">85</span>
              <span className="score-label">/ 100</span>
            </div>
          </div>
          <div className="health-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '85%'}}></div>
            </div>
          </div>
          <div className="health-tips">
            <p>💡 <strong>Tip:</strong> Great job! You're saving {getSavingsPercentage()}% of your income this month.</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
