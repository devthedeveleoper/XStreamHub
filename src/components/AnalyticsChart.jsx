"use client";

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsChart = ({ videos }) => {
  const labels = videos.map(video => video.title);
  const viewsData = videos.map(video => video.views);
  const likesData = videos.map(video => video.likesCount);
  const commentsData = videos.map(video => video.commentCount);

  const data = {
    labels,
    datasets: [
      {
        label: 'Views',
        data: viewsData,
        backgroundColor: 'rgba(54, 162, 235, 0.6)', // Blue
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Likes',
        data: likesData,
        backgroundColor: 'rgba(75, 192, 192, 0.6)', // Green
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Comments',
        data: commentsData,
        backgroundColor: 'rgba(255, 206, 86, 0.6)', // Yellow
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Video Performance Overview',
      },
    },
    scales: {
        y: {
            beginAtZero: true
        }
    }
  };

  return <Bar options={options} data={data} />;
};

export default AnalyticsChart;