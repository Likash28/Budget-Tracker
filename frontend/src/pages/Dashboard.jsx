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
            <div className="card-icon income-icon">💰</div>
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
            <span className="trend-icon">📊</span>
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
            <span className="trend-icon">🎯</span>
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
                <div className="no-data-icon">📊</div>
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
                    {transaction.type === 'income' ? '💰' : '💸'}
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
            <span className="btn-icon">💳</span>
            <span>Transactions</span>
          </Link>
          <Link to="/budgets" className="action-btn secondary">
            <span className="btn-icon">🎯</span>
            <span>Budgets</span>
          </Link>
          <Link to="/groups" className="action-btn secondary">
            <span className="btn-icon">👥</span>
            <span>Groups</span>
          </Link>
          <Link to="/reports" className="action-btn secondary">
            <span className="btn-icon">📊</span>
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
