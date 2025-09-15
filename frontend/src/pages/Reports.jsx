import React, { useEffect, useState } from 'react'
import api from '../services/api.js'
import { Pie, Line } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
ChartJS.register(ArcElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend)
import { useNavigate } from 'react-router-dom'
import '../styles.css'

export default function Reports(){
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7))
  const [summary, setSummary] = useState({ categories: [], income: 0, expense: 0, savings: 0 })
  const [trend, setTrend] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const navigate = useNavigate()

  useEffect(()=>{
    const token = localStorage.getItem('jwt')
    console.log("Token value in reports:", token)
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

  useEffect(() => {
    let isMounted = true
    
    const loadReportsData = async () => {
      setLoading(true)
      setError(null)
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn('Reports loading timeout - setting fallback data')
          setSummary({ categories: [], income: 0, expense: 0, savings: 0 })
          setTrend([])
          setError('Loading timeout - please try again')
          setLoading(false)
        }
      }, 10000) // 10 second timeout
      
      try {
        // Fetch current month summary
        const summaryResponse = await api.get('/reports/summary', { params: { month } })
        if (isMounted) {
          setSummary(summaryResponse.data)
        }
        
        // Fetch trend data for last 6 months (simplified to avoid too many API calls)
        const now = new Date(month + '-01T00:00:00Z')
        const months = [...Array(6)].map((_, i) => {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
          return date.toISOString().slice(0, 7)
        })
        
        // Only fetch trend data if we have a valid month
        if (months.length > 0) {
          const trendPromises = months.map(monthStr => 
            api.get('/reports/summary', { params: { month: monthStr } })
              .then(response => response.data)
              .catch(error => {
                console.warn(`Failed to fetch data for ${monthStr}:`, error)
                return { income: 0, expense: 0, savings: 0, categories: [] }
              })
          )
          
          const trendData = await Promise.all(trendPromises)
          if (isMounted) {
            setTrend(trendData.reverse())
          }
        }
        
        clearTimeout(timeoutId)
        
      } catch (error) {
        console.error('Error loading reports:', error)
        if (isMounted) {
          // Set fallback data
          setSummary({ categories: [], income: 0, expense: 0, savings: 0 })
          setTrend([])
          setError('Failed to load reports data. Please try again.')
        }
        clearTimeout(timeoutId)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadReportsData()
    
    // Cleanup function
    return () => {
      isMounted = false
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

  const getSavingsRate = () => {
    if (summary.income === 0) return 0
    return ((summary.savings / summary.income) * 100).toFixed(1)
  }

  const getExpenseRate = () => {
    if (summary.income === 0) return 0
    return ((summary.expense / summary.income) * 100).toFixed(1)
  }

  const getCategoryIcon = (category) => {
    const icons = {
      'Food': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.1 13.34L2 19.44L4.56 22L10.66 15.9L8.1 13.34ZM19.07 4.93C20.88 6.74 20.88 9.6 19.07 11.41L13.41 17.07C12.63 17.85 11.37 17.85 10.59 17.07L6.93 13.41C6.15 12.63 6.15 11.37 6.93 10.59L12.59 4.93C14.4 3.12 17.26 3.12 19.07 4.93Z" fill="currentColor"/>
        </svg>
      ),
      'Transport': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.92 6C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6ZM6.5 6.5H17.5L19 12H5L6.5 6.5ZM7 13.5C7.83 13.5 8.5 14.17 8.5 15S7.83 16.5 7 16.5 5.5 15.83 5.5 15 6.17 13.5 7 13.5ZM17 13.5C17.83 13.5 18.5 14.17 18.5 15S17.83 16.5 17 16.5 15.5 15.83 15.5 15 16.17 13.5 17 13.5Z" fill="currentColor"/>
        </svg>
      ),
      'Entertainment': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 3H3C1.9 3 1 3.9 1 5V19C1 20.1 1.9 21 3 21H21C22.1 21 23 20.1 23 19V5C23 3.9 22.1 3 21 3ZM21 19H3V5H21V19ZM8 15V9L13 12L8 15Z" fill="currentColor"/>
        </svg>
      ),
      'Shopping': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7ZM9 8V17H11V8H9ZM13 8V17H15V8H13Z" fill="currentColor"/>
        </svg>
      ),
      'Health': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
        </svg>
      ),
      'Education': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" fill="currentColor"/>
        </svg>
      ),
      'Travel': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" fill="currentColor"/>
        </svg>
      ),
      'Utilities': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 3V7H11V3H13ZM20 10H16V8H20V10ZM4 10H8V8H4V10ZM13 17V21H11V17H13ZM20 14H16V12H20V14ZM4 14H8V12H4V14ZM17 6H7C5.9 6 5 6.9 5 8V16C5 17.1 5.9 18 7 18H17C18.1 18 19 17.1 19 16V8C19 6.9 18.1 6 17 6ZM17 16H7V8H17V16Z" fill="currentColor"/>
        </svg>
      ),
      'Other': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20ZM12 6C9.79 6 8 7.79 8 10S9.79 14 12 14 16 12.21 16 10 14.21 6 12 6ZM12 12C10.9 12 10 11.1 10 10S10.9 8 12 8 14 8.9 14 10 13.1 12 12 12Z" fill="currentColor"/>
        </svg>
      )
    }
    return icons[category] || icons['Other']
  }

  const pieData = {
    labels: summary.categories?.map(c => c._id) || [],
    datasets: [{ 
      data: summary.categories?.map(c => c.total) || [],
      backgroundColor: [
        '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', 
        '#00f2fe', '#43e97b', '#38f9d7', '#ffecd2', '#fcb69f'
      ],
      borderWidth: 3,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      hoverBorderWidth: 4,
      hoverBorderColor: 'rgba(255, 255, 255, 0.3)'
    }]
  }

  const lineData = {
    labels: trend.map((_,i)=> {
      const date = new Date(month+'-01T00:00:00Z')
      date.setMonth(date.getMonth() - (5-i))
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    }),
    datasets: [
      { 
        label: 'Income', 
        data: trend.map(t => t.income || 0),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      },
      { 
        label: 'Expense', 
        data: trend.map(t => t.expense || 0),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointBackgroundColor: '#ef4444',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      },
      { 
        label: 'Savings', 
        data: trend.map(t => t.savings || 0),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 2,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#E5E7EB',
          font: { size: 14, weight: '600' },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 15, 35, 0.95)',
        titleColor: '#E5E7EB',
        bodyColor: '#E5E7EB',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: { size: 14, weight: '600' },
        bodyFont: { size: 13 },
        padding: 12
      }
    },
    scales: {
      x: {
        ticks: { 
          color: '#9CA3AF',
          font: { size: 12, weight: '500' }
        },
        grid: { 
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        }
      },
      y: {
        ticks: { 
          color: '#9CA3AF',
          font: { size: 12, weight: '500' },
          callback: function(value) {
            return formatCurrency(value)
          }
        },
        grid: { 
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      }
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6
      }
    }
  }

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#E5E7EB',
          font: { size: 14, weight: '600' },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 15, 35, 0.95)',
        titleColor: '#E5E7EB',
        bodyColor: '#E5E7EB',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: { size: 14, weight: '600' },
        bodyFont: { size: 13 },
        padding: 12,
        callbacks: {
          label: function(context) {
            const label = context.label || ''
            const value = context.parsed || 0
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${formatCurrency(value)} (${percentage}%)`
          }
        }
      }
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      }
    }
  }

  if (loading) {
    return (
      <div className="reports-container">
        <div className="reports-loading">
          <div className="loading-spinner-large"></div>
          <p>Loading your financial reports...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="reports-container">
        <div className="reports-content">
          <div className="error-state">
            <div className="error-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
              </svg>
            </div>
            <h2>Error Loading Reports</h2>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="retry-btn"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="reports-container">
      <div className="reports-content">
        {/* Header Section */}
        <div className="reports-header">
          <div className="header-info">
            <h1>Financial Reports</h1>
            <p>Comprehensive insights into your financial health and spending patterns</p>
          </div>
          <div className="month-selector">
            <label htmlFor="monthFilter">Select Month:</label>
            <input 
              id="monthFilter"
              type="month" 
              value={month} 
              onChange={e=>setMonth(e.target.value)}
              className="month-input"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card income">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="card-content">
              <h3>Total Income</h3>
              <p className="amount">{formatCurrency(summary.income || 0)}</p>
              <div className="card-metric">
                <span className="metric-label">Income Rate</span>
                <span className="metric-value">100%</span>
              </div>
            </div>
          </div>
          <div className="summary-card expense">
            <div className="card-icon">💸</div>
            <div className="card-content">
              <h3>Total Expenses</h3>
              <p className="amount">{formatCurrency(summary.expense || 0)}</p>
              <div className="card-metric">
                <span className="metric-label">Expense Rate</span>
                <span className="metric-value">{getExpenseRate()}%</span>
              </div>
            </div>
          </div>
          <div className="summary-card savings">
            <div className="card-icon">💎</div>
            <div className="card-content">
              <h3>Net Savings</h3>
              <p className={`amount ${summary.savings >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(summary.savings || 0)}
              </p>
              <div className="card-metric">
                <span className="metric-label">Savings Rate</span>
                <span className={`metric-value ${summary.savings >= 0 ? 'positive' : 'negative'}`}>
                  {getSavingsRate()}%
                </span>
              </div>
            </div>
          </div>
          <div className="summary-card insights">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM7 10H9V16H7V10ZM11 6H13V16H11V6ZM15 8H17V16H15V8Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="card-content">
              <h3>Financial Health</h3>
              <p className="amount">
                {summary.savings >= 0 ? 'Healthy' : 'Needs Attention'}
              </p>
              <div className="card-metric">
                <span className="metric-label">Status</span>
                <span className={`metric-value ${summary.savings >= 0 ? 'positive' : 'negative'}`}>
                  {summary.savings >= 0 ? 'Good' : 'Poor'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          <div className="chart-card pie-chart-card">
            <div className="chart-header">
              <h3>Expense Categories</h3>
              <p>Breakdown by category for {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="chart-container pie-chart">
              <div className="chart-wrapper">
                {summary.categories && summary.categories.length > 0 ? (
                  <Pie data={pieData} options={pieOptions} />
                ) : (
                  <div className="no-data">
                    <div className="no-data-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM7 10H9V16H7V10ZM11 6H13V16H11V6ZM15 8H17V16H15V8Z" fill="currentColor"/>
                      </svg>
                    </div>
                    <h4>No Data Available</h4>
                    <p>No expense categories found for this month</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="chart-card line-chart-card">
            <div className="chart-header">
              <h3>6-Month Financial Trend</h3>
              <p>Income, expenses, and savings over the last 6 months</p>
            </div>
            <div className="chart-container line-chart">
              <div className="chart-wrapper">
                <Line data={lineData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        {summary.categories && summary.categories.length > 0 && (
          <div className="category-breakdown">
            <div className="section-header">
              <h2>Category Breakdown</h2>
              <p>Detailed analysis of your spending by category</p>
            </div>
            <div className="category-list">
              {summary.categories.map((category, index) => {
                const percentage = summary.expense > 0 ? ((category.total / summary.expense) * 100).toFixed(1) : 0
                return (
                  <div key={category._id} className="category-item">
                    <div className="category-info">
                      <div className="category-icon">{getCategoryIcon(category._id)}</div>
                      <div className="category-details">
                        <span className="category-name">{category._id}</span>
                        <span className="category-percentage">{percentage}% of total expenses</span>
                      </div>
                    </div>
                    <div className="category-amount">
                      {formatCurrency(category.total || 0)}
                    </div>
                    <div className="category-bar">
                      <div 
                        className="category-progress"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: pieData.datasets[0].backgroundColor[index]
                        }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Financial Insights */}
        <div className="insights-section">
          <div className="section-header">
            <h2>Financial Insights</h2>
            <p>Key metrics and recommendations for better financial health</p>
          </div>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="insight-content">
                <h3>Savings Goal</h3>
                <p className="insight-value">{getSavingsRate()}%</p>
                <p className="insight-description">
                  {getSavingsRate() >= 20 ? 'Excellent savings rate!' : 
                   getSavingsRate() >= 10 ? 'Good savings rate, aim for 20%' : 
                   'Consider increasing your savings rate'}
                </p>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">📈</div>
              <div className="insight-content">
                <h3>Expense Control</h3>
                <p className="insight-value">{getExpenseRate()}%</p>
                <p className="insight-description">
                  {getExpenseRate() <= 80 ? 'Good expense control!' : 
                   getExpenseRate() <= 90 ? 'Monitor your expenses closely' : 
                   'Consider reducing your expenses'}
                </p>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">💡</div>
              <div className="insight-content">
                <h3>Recommendation</h3>
                <p className="insight-value">
                  {summary.savings >= 0 ? 'Maintain' : 'Improve'}
                </p>
                <p className="insight-description">
                  {summary.savings >= 0 ? 
                    'Keep up the good work with your financial management' : 
                    'Focus on reducing expenses or increasing income to improve your financial health'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
