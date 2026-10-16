"use client";

import React, { useState } from "react";
import { CreatorPack, Question } from "@/types/game";
import { Plus, Trash2, X, Sparkles, Check, DollarSign } from "lucide-react";

interface CreatorStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePack: (pack: CreatorPack) => void;
}

export const CreatorStudioModal: React.FC<CreatorStudioModalProps> = ({
  isOpen,
  onClose,
  onSavePack,
}) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [tags, setTags] = useState("Văn Hóa, Đố Vui");

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      text: "Việt Nam có bao nhiêu tỉnh thành phố trực thuộc trung ương?",
      options: ["61", "62", "63", "64"],
      correctAnswer: "C",
      timeLimit: 15,
      explanation: "Việt Nam hiện có 63 tỉnh và thành phố trực thuộc Trung ương.",
      difficulty: "easy",
    },
    {
      id: 2,
      text: "Đại dương nào có diện tích lớn nhất trên Trái Đất?",
      options: ["Đại Tây Dương", "Thái Bình Dương", "Ấn Độ Dương", "Bắc Băng Dương"],
      correctAnswer: "B",
      timeLimit: 15,
      explanation: "Thái Bình Dương là đại dương lớn nhất và sâu nhất trên Trái Đất.",
      difficulty: "medium",
    },
  ]);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    const newId = questions.length + 1;
    setQuestions([
      ...questions,
      {
        id: newId,
        text: `Câu hỏi số ${newId}...`,
        options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
        correctAnswer: "A",
        timeLimit: 15,
        explanation: "Giải thích câu trả lời...",
        difficulty: "medium",
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, idx) => idx !== index));
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...questions];
    const opts = [...(updated[qIndex].options || [])];
    opts[optIndex] = text;
    updated[qIndex].options = opts;
    setQuestions(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      alert("Vui lòng điền tiêu đề và tên tác giả!");
      return;
    }

    const newPack: CreatorPack = {
      id: `pack-${Date.now()}`,
      title: title.trim(),
      author: author.trim(),
      description: description.trim() || "Bộ câu hỏi sáng tạo từ cộng đồng",
      price: Number(price) || 0,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      questions: questions,
      playsCount: 0,
      isOfficial: false,
    };

    onSavePack(newPack);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[#FFFDF7] border-2 border-black rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[6px_6px_0px_0px_#1C1917] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b-2 border-black flex items-center justify-between bg-[#FDE047]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-black" />
            <h2 className="font-black text-base uppercase tracking-tight text-black">
              Creator Studio - Sáng Tạo Game Show
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl border-2 border-black bg-white hover:bg-slate-100 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <X className="w-4 h-4 text-black" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-[#1C1917] mb-1">
                Tên Bộ Đề Gameshow *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Thử Thách Văn Học Cực Đỉnh"
                className="w-full bg-white border-2 border-black rounded-2xl px-3 py-2 text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black shadow-[2px_2px_0px_0px_#1C1917]"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#1C1917] mb-1">
                Tên Nhà Sáng Tạo (Creator) *
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="VD: Pablo_Gamer"
                className="w-full bg-white border-2 border-black rounded-2xl px-3 py-2 text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black shadow-[2px_2px_0px_0px_#1C1917]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-[#1C1917] mb-1">
                Định giá (VNĐ)
              </label>
              <select
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-white border-2 border-black rounded-2xl px-3 py-2 text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black shadow-[2px_2px_0px_0px_#1C1917]"
              >
                <option value={0}>Miễn phí cho cộng đồng (0 VNĐ)</option>
                <option value={10000}>Gói ủng hộ tác giả (10.000 VNĐ)</option>
                <option value={20000}>Gói nâng cao (20.000 VNĐ)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#1C1917] mb-1">
                Thẻ phân loại
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Khoa học, Lịch sử, Anime..."
                className="w-full bg-white border-2 border-black rounded-2xl px-3 py-2 text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black shadow-[2px_2px_0px_0px_#1C1917]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#1C1917] mb-1">
              Mô tả ngắn
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Giới thiệu nội dung câu hỏi..."
              className="w-full bg-white border-2 border-black rounded-2xl px-3 py-2 text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black shadow-[2px_2px_0px_0px_#1C1917]"
            />
          </div>

          {/* Danh sách câu hỏi */}
          <div className="space-y-3 pt-2 border-t-2 border-black/10">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-xs uppercase text-[#1C1917]">
                Danh sách câu hỏi ({questions.length})
              </h3>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center gap-1 text-xs bg-[#86EFAC] text-black border-2 border-black px-3 py-1 rounded-xl font-black shadow-[2px_2px_0px_0px_#1C1917] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm câu
              </button>
            </div>

            {questions.map((q, qIdx) => (
              <div
                key={q.id}
                className="bg-white border-2 border-black rounded-2xl p-3.5 space-y-2.5 shadow-[3px_3px_0px_0px_#1C1917]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-[#FDE047] border border-black">
                    Câu {qIdx + 1}
                  </span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  required
                  value={q.text}
                  onChange={(e) => handleQuestionChange(qIdx, "text", e.target.value)}
                  placeholder="Nhập nội dung câu hỏi..."
                  className="w-full bg-[#F7F4EB] border-2 border-black rounded-xl px-2.5 py-1.5 text-xs font-bold text-black focus:outline-none"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(q.options || ["", "", "", ""]).map((opt, optIdx) => {
                    const label = String.fromCharCode(65 + optIdx);
                    const isCorrect = q.correctAnswer === label;
                    return (
                      <div key={optIdx} className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuestionChange(qIdx, "correctAnswer", label)}
                          className={`w-6 h-6 rounded-lg text-xs font-black border-2 border-black flex items-center justify-center shrink-0 ${
                            isCorrect ? "bg-[#86EFAC] shadow-[1px_1px_0px_0px_#000]" : "bg-white"
                          }`}
                        >
                          {label}
                        </button>
                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                          placeholder={`Lựa chọn ${label}`}
                          className="flex-1 bg-[#F7F4EB] border border-black rounded-lg px-2 py-1 text-xs font-semibold text-black focus:outline-none"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl text-xs font-bold neo-btn-secondary"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl text-xs font-black neo-btn-primary flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Xuất Bản Ngay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
