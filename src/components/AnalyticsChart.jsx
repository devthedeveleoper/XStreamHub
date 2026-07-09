"use client";

import React from 'react';
import { Bar } from 'react-chartjs-2';
import { useTheme } from "next-themes";
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const textColor = isDark ? '#e2e8f0' : '#334155'; // slate-200 or slate-700
  const gridColor = isDark ? '#334155' : '#e2e8f0'; // slate-700 or slate-200

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
        backgroundColor: 'rgba(99, 102, 241, 0.7)', // Indigo
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Likes',
        data: likesData,
        backgroundColor: 'rgba(139, 92, 246, 0.7)', // Violet
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Comments',
        data: commentsData,
        backgroundColor: 'rgba(236, 72, 153, 0.7)', // Pink
        borderColor: 'rgba(236, 72, 153, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor,
          font: {
            family: "'Inter', sans-serif",
            weight: '500'
          }
        }
      },
      title: {
        display: true,
        text: 'Video Performance Overview',
        color: textColor,
        font: {
          family: "'Inter', sans-serif",
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: {
              color: gridColor,
            },
            ticks: {
              color: textColor,
            }
        },
        x: {
            grid: {
              display: false,
            },
            ticks: {
              color: textColor,
            }
        }
    }
  };

  return <Bar options={options} data={data} />;
};

export default AnalyticsChart;