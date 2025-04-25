import { useState } from "react";
import axios from "axios";

const ReplyForm = ({ commentId, currentUserEmail, fetchComments }) => {
  const [text, setText] = useState("");

  const handleReply = async () => {
    if (text.trim() === "") return;
    await axios.post(`/api/comments/${commentId}/reply`, {
      userEmail: currentUserEmail,
      text
    });
    setText("");
    fetchComments();
  };

  return (
    <div className="flex gap-2">
      <input
        className="flex-1 p-1 border rounded"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a reply..."
      />
      <button className="text-blue-500" onClick={handleReply}>Reply</button>
    </div>
  );
};

export default ReplyForm;
