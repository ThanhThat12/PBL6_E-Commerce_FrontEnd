import React from 'react';
import { Card } from 'antd';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './UsersChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const UsersChart = ({ usersData }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1f2937',
        padding: 12,
        displayColors: false
      }
    },
    scales: {
      y: {
        display: false,
        beginAtZero: true
      },
      x: {
        display: false
      }
    }
  };

  const data = {
    labels: usersData?.map((_, index) => `${index * 2}min`) || [],
    datasets: [
      {
        data: usersData || [],
        backgroundColor: '#10b981',
        borderRadius: 4,
        barThickness: 8
      }
    ]
  };

  return (
    <Card className="users-chart-card">
      <div className="users-header">
        <div>
          <div className="users-label">Users in last 30 minutes</div>
          <div className="users-count">21.5K</div>
        </div>
      </div>
      <div className="chart-container">
        <Bar options={options} data={data} height={80} />
      </div>
      <div className="users-footer">Users per minute</div>
    </Card>
  );
};
