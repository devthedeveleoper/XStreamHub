"use client";

import React from 'react';
import { Line } from 'react-chartjs-2';
import { useTheme } from "next-themes";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TimeSeriesChart = ({ timeSeries }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const textColor = isDark ? '#e2e8f0' : '#334155';
  const gridColor = isDark ? '#334155' : '#e2e8f0';

  if (!timeSeries || timeSeries.length === 0) return null;

  const labels = timeSeries.map(d => d.date);
  const viewsData = timeSeries.map(d => d.views);
  const likesData = timeSeries.map(d => d.likes);

  const data = {
    labels,
    datasets: [
      {
        label: 'Views',
        data: viewsData,
        borderColor: 'rgba(99, 102, 241, 1)', // Indigo
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointRadius: 2,
        pointHoverRadius: 5,
      },
      {
        label: 'Likes',
        data: likesData,
        borderColor: 'rgba(236, 72, 153, 1)', // Pink
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(236, 72, 153, 1)',
        pointRadius: 2,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor,
          usePointStyle: true,
          font: {
            family: "'Inter', sans-serif",
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
      }
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: {
              color: gridColor,
              drawBorder: false,
            },
            ticks: {
              color: textColor,
              precision: 0,
            }
        },
        x: {
            grid: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              color: textColor,
              maxTicksLimit: 10,
            }
        }
    }
  };

  return (
    <div className="w-full h-[400px]">
      <Line options={options} data={data} />
    </div>
  );
};

export default TimeSeriesChart;
