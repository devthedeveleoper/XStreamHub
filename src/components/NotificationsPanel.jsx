"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import API from '@/lib/api';
import { useSession } from 'next-auth/react';
import { FaBell } from 'react-icons/fa';

const NotificationsPanel = () => {
    const { data: session, status } = useSession();
    const isAuthenticated = status === "authenticated";

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef(null);

    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchNotifications = async () => {
            try {
                const res = await API.get('/notifications');
                setNotifications(res.data.notifications);
                setUnreadCount(res.data.unreadCount);
            } catch (error) { 
                console.error("Failed to fetch notifications", error); 
            }
        };
        
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleBellClick = async () => {
        setIsOpen(!isOpen);
        if (!isOpen && unreadCount > 0) {
            try {
                await API.post('/notifications');
                setUnreadCount(0);
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            } catch (error) { 
                console.error("Failed to mark notifications as read", error); 
            }
        }
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="relative" ref={panelRef}>
            <button onClick={handleBellClick} className="relative text-gray-600 hover:text-blue-600 p-2">
                <FaBell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {unreadCount}
                    </span>
                )}
            </button>
            
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border overflow-hidden">
                    <div className="p-3 font-bold text-sm border-b">Notifications</div>
                    <ul className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(notif => (
                            <li key={notif._id}>
                                <Link href={`/video/${notif.video?._id}`} onClick={() => setIsOpen(false)} className={`block border-t p-3 text-sm hover:bg-gray-100 ${!notif.isRead ? 'bg-blue-50' : ''}`}>
                                    <p>
                                        <strong className="font-semibold">{notif.sender.username}</strong>
                                        {notif.type === 'like' && ` liked your video: "${notif.video?.title}"`}
                                        {notif.type === 'comment' && ` commented on your video: "${notif.video?.title}"`}
                                        {notif.type === 'reply' && ` replied to your comment.`}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                                </Link>
                            </li>
                            ))
                        ) : (
                            <li className="p-4 text-center text-gray-500">No new notifications.</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default NotificationsPanel;