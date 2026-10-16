# 🔔 GameShow Together - Đấu Trường Chuông Vàng (Prototype)

Nền tảng Web Game Show trực tuyến tương tác theo thời gian thực (Real-time Party Game Show), tích hợp **Webcam avatar tròn**, hệ thống phòng đấu (Lobby / Custom Room), và chợ nội dung kịch bản **Creator Workshop**.

---

## 🚀 Các tính năng đã hoàn thiện trong Prototype

1. **Format Rung Chuông Vàng (Đấu Trường Chuông Vàng):**
   - Bộ đề thử thách chuẩn 15 câu tăng dần độ khó (từ Dễ đến câu hỏi Rung Chuông Vàng).
   - Đồng hồ đếm ngược 15s kịch tính kèm hiệu ứng âm thanh tích-tắc và báo động 3s cuối.
   - Sàn đấu trung tâm hiển thị 4 phương án trắc nghiệm A, B, C, D; chọn phương án và khóa bài nộp.
   - Hết giờ tự động công bố đáp án đúng kèm giải thích kiến thức chi tiết.
   - Cơ chế Đào Thải: Trả lời sai lập tức bị chuyển thành khán giả theo dõi.
   - Người trụ lại cuối cùng sẽ **Rung Chuông Vàng** trong tiếng chuông rền vang và pháo hoa rực rỡ!

2. **Webcam Tròn & WebRTC:**
   - Người chơi xuất hiện với avatar hình tròn xung quanh sàn đấu.
   - Cho phép bật/tắt camera thật và micro của thiết bị ngay trên avatar hoặc tại màn hình chuẩn bị.
   - Trạng thái người chơi: Đang sống sót (viền vàng/xanh), Bị loại (viền đỏ/xám), Đã nộp bài, Vương miện Host.

3. **Cứu Trợ Thần Kỳ (Revival Mechanism):**
   - Host có quyền kích hoạt nút "Cứu trợ hồi sinh" để đưa toàn bộ thí sinh đã bị loại trở lại sàn đấu.

4. **Creator Studio & Workshop:**
   - Cho phép người chơi tự tạo gói gameshow của riêng mình (Tiêu đề, Tác giả, Giá bán 0đ hoặc có phí, Thẻ phân loại).
   - Form soạn thảo câu hỏi linh hoạt: nội dung câu hỏi, 4 phương án, đáp án đúng, giải thích và thời gian suy nghĩ.
   - Lưu trữ và chọn gói đề ngay tại phòng đấu.

5. **Phòng đấu Realtime & Kênh Chat:**
   - Hệ thống mã phòng ngẫu nhiên 6 chữ số (VD: `BELL99`).
   - Nút sao chép link phòng nhanh để gửi cho bạn bè qua Zalo, Messenger, Discord.
   - Kênh chat real-time trong phòng.

6. **Web Audio Synthesizer:**
   - Tích hợp âm thanh chuông vàng, tích tắc đồng hồ, chime đúng, buzzer sai bằng Web Audio API (hoạt động 100% không lo lỗi tải file).

---

## 🛠️ Hướng dẫn khởi chạy & Trải nghiệm

1. **Khởi động Server:**
   ```bash
   npm run dev
   ```
   Server sẽ chạy tại: [http://localhost:3000](http://localhost:3000)

2. **Trải nghiệm Multiplayer với nhiều người:**
   - Mở tab 1 (trình duyệt 1): Vào [http://localhost:3000](http://localhost:3000), nhập tên (VD: `Host Minh`), bấm **Tạo Phòng Nhanh**.
   - Bấm nút **"Mời bạn"** để sao chép link phòng.
   - Mở tab 2 (hoặc cửa sổ ẩn danh / điện thoại khác cùng mạng Wi-Fi): Dán link phòng hoặc nhập mã phòng, đặt tên (VD: `Thí sinh An`), tham gia vào phòng.
   - Tab Host bấm **"Bắt đầu thi đấu"** để bắt đầu tranh tài Rung Chuông Vàng!

---

## 📦 Công nghệ sử dụng
- **Frontend:** Next.js 14 (React 18), Tailwind CSS, Lucide React, Canvas Confetti.
- **Backend & Realtime:** Node.js, Socket.io Server, tsx.
- **Webcam & Audio:** WebRTC MediaStream, Web Audio API Synthesizer.
