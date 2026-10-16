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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-yellow-500/30 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <h2 className="font-extrabold text-lg gold-gradient-text">
              Creator Studio - Sáng Tạo Game Show
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tên Bộ Đề Gameshow *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Thử Thách Văn Học Cực Đỉnh"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-yellow-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tên Nhà Sáng Tạo (Creator) *
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="VD: MasterMind_99"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-yellow-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-yellow-400" />
                Mô hình định giá (VNĐ)
              </label>
              <select
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-yellow-500"
              >
                <option value={0}>Miễn phí cho cộng đồng (0 VNĐ)</option>
                <option value={10000}>Gói ủng hộ tác giả (10.000 VNĐ)</option>
                <option value={20000}>Gói nâng cao (20.000 VNĐ)</option>
                <option value={50000}>Gói VIP độc quyền (50.000 VNĐ)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Thẻ phân loại (Cách nhau bằng dấu phẩy)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Khoa học, Lịch sử, Anime..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-yellow-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mô tả ngắn về bộ đề
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Giới thiệu nội dung, độ khó hoặc lưu ý dành cho người chơi..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-yellow-500"
            />
          </div>

          {/* Danh sách câu hỏi */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-yellow-300">
                Danh sách câu hỏi ({questions.length})
              </h3>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center gap-1.5 text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/40 px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm câu hỏi
              </button>
            </div>

            {questions.map((q, qIdx) => (
              <div
                key={q.id}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                    Câu {qIdx + 1}
                  </span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      title="Xóa câu này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  required
                  value={q.text}
                  onChange={(e) => handleQuestionChange(qIdx, "text", e.target.value)}
                  placeholder="Nhập nội dung câu hỏi..."
                  className="w-full bg-slate-900 border border-slate-700/70 rounded-lg px-3 py-2 text-sm text-slate-100 font-medium focus:outline-none focus:border-yellow-500"
                />

                {/* 4 phương án A, B, C, D */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(q.options || ["", "", "", ""]).map((opt, optIdx) => {
                    const label = String.fromCharCode(65 + optIdx); // A, B, C, D
                    const isCorrect = q.correctAnswer === label;
                    return (
                      <div key={optIdx} className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuestionChange(qIdx, "correctAnswer", label)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center shrink-0 ${
                            isCorrect
                              ? "bg-emerald-500 text-slate-950 ring-2 ring-emerald-400"
                              : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                          }`}
                          title={`Chọn ${label} làm đáp án đúng`}
                        >
                          {label}
                        </button>
                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                          placeholder={`Lựa chọn ${label}`}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-yellow-500"
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={q.explanation}
                      onChange={(e) => handleQuestionChange(qIdx, "explanation", e.target.value)}
                      placeholder="Giải thích vì sao đáp án đúng..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span>Thời gian:</span>
                    <select
                      value={q.timeLimit}
                      onChange={(e) => handleQuestionChange(qIdx, "timeLimit", Number(e.target.value))}
                      className="bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-xs text-slate-200"
                    >
                      <option value={10}>10s</option>
                      <option value={15}>15s (Chuẩn)</option>
                      <option value={20}>20s</option>
                      <option value={30}>30s</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 hover:from-yellow-400 hover:to-amber-400 shadow-lg shadow-yellow-500/20 flex items-center gap-2 transition-transform active:scale-95"
            >
              <Check className="w-4 h-4" />
              Lưu & Xuất Bản Bộ Đề
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
