import React from 'react';
import { motion } from 'framer-motion';
import { FaEye, FaThumbsUp, FaComment, FaUsers } from 'react-icons/fa';

const StatCard = ({ title, value, icon, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-slate-700 flex items-center justify-between transition-colors"
  >
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
        {value?.toLocaleString() || 0}
      </h3>
    </div>
    <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-inner">
      {icon}
    </div>
  </motion.div>
);

const CreatorStatCards = ({ stats }) => {
  if (!stats) return null;

  const statItems = [
    { title: 'Total Views', value: stats.views, icon: <FaEye size={24} /> },
    { title: 'Total Likes', value: stats.likes, icon: <FaThumbsUp size={24} /> },
    { title: 'Comments', value: stats.comments, icon: <FaComment size={24} /> },
    { title: 'Subscribers', value: stats.subscribers, icon: <FaUsers size={24} /> },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statItems.map((item, idx) => (
        <StatCard key={idx} index={idx} title={item.title} value={item.value} icon={item.icon} />
      ))}
    </div>
  );
};

export default CreatorStatCards;
