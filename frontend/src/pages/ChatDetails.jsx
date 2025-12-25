import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { BASE_URL } from "../constants/apiConstants";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import ChatMediaUploader from "../components/chatMediaUploader";

let socket;

const ChatDetails = () => {
  const { chatId, jobId, providerId } = useParams();
  const { user } = useSelector((state) => state.auth);

  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  const [chat, setChat] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const messagesEndRef = useRef(null);
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // ------------------- FETCH OR CREATE CHAT -------------------
  useEffect(() => {
    const fetchChat = async () => {
      try {
        let res;
        if (jobId)
          res = await axios.get(`${BASE_URL}/chat/job/${jobId}`, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
        else if (providerId)
          res = await axios.post(
            `${BASE_URL}/chat/provider/${providerId}`,
            {},
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
        else if (chatId)
          res = await axios.get(`${BASE_URL}/chat/${chatId}`, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
        else throw new Error("No chat identifier provided");

        const chatData = res.data;
        setChat(chatData);
        setMessages(chatData.messages || []);

        const participants = Array.isArray(chatData.participants)
          ? chatData.participants.filter((p) => p && p._id)
          : [];
        const otherUser =
          participants.find((p) => String(p._id) !== String(user._id)) ||
          participants[0] ||
          null;
        setChatUser(otherUser);
      } catch (err) {
        console.error("Chat load error:", err);
      } finally {
        setLoading(false);
        scrollToBottom();
      }
    };
    if (user?._id) fetchChat();
  }, [chatId, jobId, providerId, user]);

  // ------------------- SOCKET.IO -------------------
  useEffect(() => {
    if (!user || !chat) return;
    socket = io(BASE_URL, { auth: { token: user.token } });
    socket.emit("joinRoom", chat._id || chatId);
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });
    return () => socket.disconnect();
  }, [chat, user]);

  // ------------------- SEND MESSAGE -------------------
  const handleSendMessage = async () => {
    if (!inputMessage.trim() && selectedFiles.length === 0) return;

    // ------------------- TEMP MESSAGES -------------------
    const tempMsgs = [];

    if (inputMessage.trim()) {
      tempMsgs.push({
        text: inputMessage,
        sender: { _id: user._id, name: user.name },
        createdAt: new Date().toISOString(),
      });
    }

    selectedFiles.forEach((file) => {
      tempMsgs.push({
        attachments: [URL.createObjectURL(file)],
        sender: { _id: user._id, name: user.name },
        createdAt: new Date().toISOString(),
      });
    });

    setMessages((prev) => [...prev, ...tempMsgs]);
    scrollToBottom();
    setInputMessage("");

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));

    try {
      if (inputMessage.trim()) {
        await axios.post(
          `${BASE_URL}/chat/${chat._id || chatId}`,
          { text: inputMessage },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      }

      if (selectedFiles.length > 0) {
        const res = await axios.post(
          `${BASE_URL}/chat/${chat._id}/media`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        // You could replace temp messages with server messages if needed
        socket.emit("sendMessage", {
          chatId: chat._id,
          attachments: res.data.message.attachments,
          sender: user._id,
        });
        setSelectedFiles([]);
      }
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center">
        <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
      </div>
    );

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* HEADER */}
      <div className="flex items-center gap-3 bg-white p-4 shadow-md">
        <ArrowLeft className="w-6 h-6" onClick={() => history.back()} />
        <img
          src={chatUser?.profileImage || "/default-avatar.png"}
          alt=""
          className="w-10 h-10 rounded-full border"
        />
        <p className="font-semibold text-lg">{chatUser?.name || "Chat User"}</p>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => {
          const senderId = msg.sender?._id || msg.sender;
          const isMe = String(senderId) === String(user._id);

          return (
            <div
              key={i}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-xl ${
                  isMe ? "bg-blue-500 text-white" : "bg-white border text-black"
                }`}
              >
                {msg.text}
                {msg.attachments &&
                  msg.attachments.map((att, idx) =>
                    att.type?.startsWith("video") ||
                    att.endsWith(".mp4") ||
                    att.endsWith(".webm") ? (
                      <video
                        key={idx}
                        src={att}
                        className="w-64 h-36 rounded mt-2"
                        controls
                      />
                    ) : (
                      <img
                        key={idx}
                        src={att}
                        className="w-64 rounded mt-2"
                        alt="media"
                      />
                    )
                  )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="flex items-center gap-2 p-4 bg-white shadow-lg">
        <ChatMediaUploader onFilesSelected={setSelectedFiles} />

        <input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2"
        />

        <Send
          className="w-6 h-6 text-blue-600 cursor-pointer"
          onClick={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default ChatDetails;
