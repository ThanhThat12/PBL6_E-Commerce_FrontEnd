import React, { useState, useEffect } from 'react';
import { CreditCard, TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle, Calendar, DollarSign, Activity, CheckCircle, Clock, XCircle, ChevronRight } from 'lucide-react';
import './WalletTable.css';

const WalletTable = () => {
  const [activeTab, setActiveTab] = useState('today');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [walletData, setWalletData] = useState({
    mainBalance: 673412.66,
    walletBalance: 824571.93,
    cardHolder: 'Samantha Anderson',
    cardNumber: '**** **** **** 1234',
    validThru: '08/21',
    balanceChange: '+0.8%'
  });

  // Mock transaction data - matching WalletTransaction entity
  const [transactions, setTransactions] = useState([
    {
      id: 1001,
      walletId: 1,
      amount: 150000.00,
      type: 'DEPOSIT',
      description: 'Top up wallet via VNPay',
      relatedOrderId: null,
      createdAt: '2024-12-11T10:30:00'
    },
    {
      id: 1002,
      walletId: 1,
      amount: 45000.00,
      type: 'ORDER_PAYMENT',
      description: 'Payment for Order #ORD-2024-001',
      relatedOrderId: 2001,
      createdAt: '2024-12-11T09:15:00'
    },
    {
      id: 1003,
      walletId: 1,
      amount: 200000.00,
      type: 'DEPOSIT',
      description: 'Deposit via Bank Transfer',
      relatedOrderId: null,
      createdAt: '2024-12-10T14:20:00'
    },
    {
      id: 1004,
      walletId: 1,
      amount: 15000.00,
      type: 'REFUND',
      description: 'Refund for cancelled order #ORD-2024-002',
      relatedOrderId: 2002,
      createdAt: '2024-12-10T11:45:00'
    },
    {
      id: 1005,
      walletId: 1,
      amount: 50000.00,
      type: 'WITHDRAWAL',
      description: 'Withdraw to bank account',
      relatedOrderId: null,
      createdAt: '2024-12-09T16:30:00'
    },
    {
      id: 1006,
      walletId: 1,
      amount: 89000.00,
      type: 'ORDER_PAYMENT',
      description: 'Payment for Order #ORD-2024-003',
      relatedOrderId: 2003,
      createdAt: '2024-12-09T13:20:00'
    },
    {
      id: 1007,
      walletId: 1,
      amount: 120000.00,
      type: 'PAYMENT_TO_SELLER',
      description: 'Payment to seller for completed order',
      relatedOrderId: 2004,
      createdAt: '2024-12-08T15:10:00'
    },
    {
      id: 1008,
      walletId: 1,
      amount: 5000.00,
      type: 'PLATFORM_FEE',
      description: 'Platform commission fee',
      relatedOrderId: 2004,
      createdAt: '2024-12-08T15:10:00'
    },
    {
      id: 1009,
      walletId: 1,
      amount: 300000.00,
      type: 'DEPOSIT',
      description: 'Top up via Momo wallet',
      relatedOrderId: null,
      createdAt: '2024-12-07T10:00:00'
    },
    {
      id: 1010,
      walletId: 1,
      amount: 25000.00,
      type: 'REFUND',
      description: 'Refund for defective product',
      relatedOrderId: 2005,
      createdAt: '2024-12-07T08:30:00'
    },
    {
      id: 1011,
      walletId: 1,
      amount: 67000.00,
      type: 'ORDER_PAYMENT',
      description: 'Payment for Order #ORD-2024-006',
      relatedOrderId: 2006,
      createdAt: '2024-12-06T17:45:00'
    },
    {
      id: 1012,
      walletId: 1,
      amount: 100000.00,
      type: 'WITHDRAWAL',
      description: 'Cash withdrawal',
      relatedOrderId: null,
      createdAt: '2024-12-06T12:20:00'
    },
    {
      id: 1013,
      walletId: 1,
      amount: 8000.00,
      type: 'PLATFORM_FEE',
      description: 'Transaction processing fee',
      relatedOrderId: 2007,
      createdAt: '2024-12-05T14:00:00'
    },
    {
      id: 1014,
      walletId: 1,
      amount: 175000.00,
      type: 'PAYMENT_TO_SELLER',
      description: 'Payment to seller - Order completed',
      relatedOrderId: 2008,
      createdAt: '2024-12-05T11:30:00'
    },
    {
      id: 1015,
      walletId: 1,
      amount: 250000.00,
      type: 'DEPOSIT',
      description: 'Top up wallet via ZaloPay',
      relatedOrderId: null,
      createdAt: '2024-12-04T09:00:00'
    }
  ]);

  // Mock recent invoices
  const [recentInvoices, setRecentInvoices] = useState([
    { id: 1, name: 'Stevan Store', time: '1h ago', amount: 562 },
    { id: 2, name: 'David Ignis', time: '2h ago', amount: 672 },
    { id: 3, name: 'Olivia Johan', time: '3h ago', amount: 769 },
    { id: 4, name: 'Melanie Wong', time: '5h ago', amount: 45 }
  ]);

  // Calculate earning categories
  const earningCategories = {
    income: 30,
    expense: 46,
    unknown: 24
  };

  // Mock chart data for balance trend
  const balanceTrend = [
    { day: 'Sun', income: 4000, expense: 2400 },
    { day: 'Mon', income: 3000, expense: 1398 },
    { day: 'Tue', income: 5000, expense: 3800 },
    { day: 'Wed', income: 2780, expense: 3908 },
    { day: 'Thu', income: 4890, expense: 2800 },
    { day: 'Fri', income: 3390, expense: 3800 },
    { day: 'Sat', income: 4490, expense: 4300 }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getTypeIcon = (type) => {
    const typeMap = {
      'DEPOSIT': <ArrowUpCircle size={16} className="icon-deposit" />,
      'WITHDRAWAL': <ArrowDownCircle size={16} className="icon-withdrawal" />,
      'ORDER_PAYMENT': <DollarSign size={16} className="icon-payment" />,
      'REFUND': <TrendingUp size={16} className="icon-refund" />,
      'PAYMENT_TO_SELLER': <ArrowDownCircle size={16} className="icon-payment-seller" />,
      'PLATFORM_FEE': <Activity size={16} className="icon-platform-fee" />
    };
    return typeMap[type] || <Activity size={16} />;
  };

  const getTransactionSign = (type) => {
    // Positive: money in, Negative: money out
    const positiveTypes = ['DEPOSIT', 'REFUND'];
    return positiveTypes.includes(type) ? '+' : '-';
  };

  const getTransactionTypeLabel = (type) => {
    const labels = {
      'DEPOSIT': 'Deposit',
      'WITHDRAWAL': 'Withdrawal',
      'ORDER_PAYMENT': 'Order Payment',
      'REFUND': 'Refund',
      'PAYMENT_TO_SELLER': 'Payment to Seller',
      'PLATFORM_FEE': 'Platform Fee'
    };
    return labels[type] || type;
  };

  const getAmountColorClass = (type) => {
    // Red: Withdrawal, Payment to Seller
    if (type === 'WITHDRAWAL' || type === 'PAYMENT_TO_SELLER') {
      return 'amount-red';
    }
    // Blue: Platform Fee
    if (type === 'PLATFORM_FEE') {
      return 'amount-blue';
    }
    // Black (normal): Deposit, Order Payment, Refund
    return 'amount-normal';
  };

  const handleTopUp = () => {
    console.log('Top Up clicked');
    // TODO: Open modal or navigate to top up page
  };

  const handleWithdraw = () => {
    console.log('Withdraw clicked');
    // TODO: Open modal or navigate to withdraw page
  };

  const filterTransactions = () => {
    // TODO: Filter by active tab (monthly/weekly/today)
    return transactions;
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filterTransactions().slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filterTransactions().length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          className={`page-number ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="wallet-container">
      {/* Top Section */}
      <div className="wallet-top-section">
        {/* Left - Transaction History */}
        <div className="payment-history-card">
          <div className="payment-history-header">
            <div>
              <h3 className="section-title">Transaction History</h3>
              <p className="section-subtitle">View all your wallet transactions</p>
            </div>
            <div className="history-tabs">
              <button 
                className={`tab-btn ${activeTab === 'monthly' ? 'active' : ''}`}
                onClick={() => setActiveTab('monthly')}
              >
                Monthly
              </button>
              <button 
                className={`tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
                onClick={() => setActiveTab('weekly')}
              >
                Weekly
              </button>
              <button 
                className={`tab-btn ${activeTab === 'today' ? 'active' : ''}`}
                onClick={() => setActiveTab('today')}
              >
                Today
              </button>
            </div>
          </div>

          {/* Transaction Table */}
          <div className="transaction-table-wrapper">
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Order ID</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="td-id">#{transaction.id}</td>
                    <td className="td-type">
                      <div className="type-cell">
                        {getTypeIcon(transaction.type)}
                        <span>{getTransactionTypeLabel(transaction.type)}</span>
                      </div>
                    </td>
                    <td className="td-description">{transaction.description}</td>
                    <td className="td-amount">
                      <span className={`amount-value ${getAmountColorClass(transaction.type)}`}>
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="td-order">
                      {transaction.relatedOrderId ? (
                        <span className="order-link">#{transaction.relatedOrderId}</span>
                      ) : (
                        <span className="no-order">-</span>
                      )}
                    </td>
                    <td className="td-date">{formatDate(transaction.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination-container">
            
            <div className="pagination-controls">
              <button 
                className="page-btn prev" 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {renderPageNumbers()}
              <button 
                className="page-btn next" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Right - Wallet Balance & Invoices */}
        <div className="wallet-right-section">
          <div className="wallet-balance-card">
            <div className="wallet-card-icon">
              <div className="card-logo"></div>
            </div>
            <h2 className="wallet-amount">{formatCurrency(walletData.walletBalance)}</h2>
            <p className="wallet-label">Wallet Balance</p>
            <p className="wallet-change">
              <TrendingUp size={16} />
              {walletData.balanceChange} than last week
            </p>
            
            {/* Action Buttons */}
            <div className="wallet-actions">
              <button className="wallet-btn wallet-btn-topup" onClick={handleTopUp}>
                <div className="btn-icon">
                  <ArrowUpCircle size={20} />
                </div>
                <span>Top Up</span>
              </button>
              <button className="wallet-btn wallet-btn-withdraw" onClick={handleWithdraw}>
                <div className="btn-icon">
                  <ArrowDownCircle size={20} />
                </div>
                <span>Withdraw</span>
              </button>
            </div>
          </div>

          {/* Invoices Below Wallet Balance */}
          <div className="invoices-card">
            <div className="invoices-header">
              <h3 className="section-title">Recent Invoices</h3>
              <p className="section-subtitle">Latest transaction records</p>
            </div>

            <div className="invoices-list">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="invoice-item">
                  <img 
                    src={`https://i.pravatar.cc/150?img=${invoice.id + 20}`} 
                    alt={invoice.name} 
                    className="invoice-avatar" 
                  />
                  <div className="invoice-info">
                    <h4 className="invoice-name">{invoice.name}</h4>
                    <p className="invoice-time">{invoice.time}</p>
                  </div>
                  <div className="invoice-amount">{formatCurrency(invoice.amount)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletTable;
