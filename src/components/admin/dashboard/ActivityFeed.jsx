import React from "react";

const ActivityFeed = ({ activities }) => {
  // Map backend type to frontend type
  const mapActivityType = (backendType) => {
    switch (backendType) {
      case 'NEW_ORDER':
        return 'order';
      case 'NEW_CUSTOMER':
        return 'user';
      case 'PRODUCT_UPDATED':
        return 'product';
      case 'ORDER_COMPLETED':
        return 'payment';
      default:
        return 'default';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'order':
        return "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z";
      case 'user':
        return "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z";
      case 'product':
        return "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4";
      case 'payment':
        return "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z";
      default:
        return "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'order':
        return '#3B82F6';
      case 'user':
        return '#10B981';
      case 'product':
        return '#F59E0B';
      case 'payment':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <div className="activity-card">
      <div className="activity-header">
        <h3 className="activity-title">Recent Activity</h3>
        <button className="view-all-btn">View All</button>
      </div>
      <div className="activity-list">
        {activities && activities.length > 0 ? (
          activities.map((activity, index) => {
            const mappedType = mapActivityType(activity.type);
            return (
              <div key={index} className="activity-item">
                <div 
                  className="activity-icon"
                  style={{ backgroundColor: `${getActivityColor(mappedType)}20`, color: getActivityColor(mappedType) }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getActivityIcon(mappedType)} />
                  </svg>
                </div>
                <div className="activity-content">
                  <div className="activity-text">{activity.message}</div>
                  <div className="activity-time">{activity.timeAgo}</div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="activity-item">
            <div className="activity-content">
              <div className="activity-text" style={{ color: '#6B7280', fontStyle: 'italic' }}>Không có hoạt động gần đây</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;