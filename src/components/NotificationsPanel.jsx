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

  console.log(notifications)

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    API.get("/notifications").then((res) => {
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    });

    if (!socketRef.current) {
      const wsUrl = (
        process.env.NEXT_PUBLIC_NOTIFICATION_SERVER_URL || "ws://localhost:4000"
      ).replace(/^http/, "ws");
      const socket = new WebSocket(`${wsUrl}/ws?userId=${user.id}`);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("Connected to Go notification server!");
      };

      socket.onmessage = (event) => {
        const newNotification = JSON.parse(event.data);
        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        // toast.info(`New notification from ${newNotification.sender.username}!`); // It's a bit annoying sometimes 😒
      };

      socket.onclose = () =>
        console.log("Disconnected from Go notification server.");
      socket.onerror = (error) => console.error("WebSocket Error:", error);
    }
    
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
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
        className="relative text-gray-600 hover:text-blue-600 p-2"
      >
        <FaBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border overflow-hidden">
          <div className="p-3 flex justify-between items-center border-b">
            <h3 className="font-bold text-sm">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-blue-600 hover:underline"
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
                    className={`flex items-start gap-3 border-t p-3 text-sm hover:bg-gray-100 ${
                      !notif.isRead ? "bg-blue-50" : ""
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
                    <div className="w-0 flex-grow">
                      <p>
                        <strong className="font-semibold">
                          {notif.sender.username}
                        </strong>
                        {notif.type === "like" &&
                          ` liked your video: "${notif.video?.title}"`}
                        {notif.type === "comment" &&
                          ` commented on your video: "${notif.video?.title}"`}
                        {notif.type === "reply" && ` replied to your comment.`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </Link>
                </li>
              ))
            ) : (
              <li className="p-4 text-center text-gray-500">
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
