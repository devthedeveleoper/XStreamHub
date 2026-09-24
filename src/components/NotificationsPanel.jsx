"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import API from "@/lib/api";
import { useSession } from "next-auth/react";
import { FaBell, FaUserCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import Image from "next/image";
// REMOVED: import io from 'socket.io-client';

const NotificationsPanel = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const user = session?.user;

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    API.get("/notifications").then((res) => {
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    });

    let isMounted = true;
    let ws = null;
    let reconnectTimer = null;

    const connectWebSocket = () => {
      if (!isMounted) return;

      const serverUrl =
        process.env.NEXT_PUBLIC_NOTIFICATION_SERVER_URL ||
        "https://aurahub-go-notifier.onrender.com";
      const wsUrl = `${serverUrl.replace(/^http/, "ws")}/ws?userId=${user.id}`;

      try {
        ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data._id) {
              setNotifications((prev) => [data, ...prev]);
              setUnreadCount((prev) => prev + 1);
              if (data?.sender?.username) {
                toast.info(`New notification from ${data.sender.username}!`);
              }
            }
          } catch {
            // Ignore non-JSON heartbeat
          }
        };

        ws.onerror = () => {
          // Handled by onclose
        };

        ws.onclose = () => {
          if (isMounted) {
            reconnectTimer = setTimeout(connectWebSocket, 5000);
          }
        };
      } catch {
        if (isMounted) {
          reconnectTimer = setTimeout(connectWebSocket, 5000);
        }
      }
    };

    connectWebSocket();

    return () => {
      isMounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = async () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      try {
        await API.post("/notifications");
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } catch (error) {
        console.error("Failed to mark notifications as read", error);
      }
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) return;
    try {
      await API.delete("/notifications");
      setNotifications([]);
      setUnreadCount(0);
      toast.success("Notifications cleared.");
    } catch (error) {
      toast.error("Failed to clear notifications.");
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleBellClick}
        className="relative text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 transition-colors"
      >
        <FaBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          <div className="p-3 flex justify-between items-center border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <li key={notif._id}>
                  <Link
                    href={`/video/${notif.video?._id}`}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-start gap-3 border-t border-gray-100 dark:border-slate-700 p-3 text-sm hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${
                      !notif.isRead ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {notif.sender.avatar ? (
                        <Image
                          src={notif.sender.avatar}
                          alt={notif.sender.username}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <FaUserCircle size={32} className="text-gray-400" />
                      )}
                    </div>
                    <div className="w-0 flex-grow text-gray-800 dark:text-gray-200">
                      <p>
                        <strong className="font-semibold text-gray-900 dark:text-white">
                          {notif.sender.username}
                        </strong>
                        {notif.type === "like" &&
                          ` liked your video: "${notif.video?.title}"`}
                        {notif.type === "comment" &&
                          ` commented on your video: "${notif.video?.title}"`}
                        {notif.type === "reply" && ` replied to your comment.`}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </Link>
                </li>
              ))
            ) : (
              <li className="p-4 text-center text-gray-500 dark:text-gray-400">
                No new notifications.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;
