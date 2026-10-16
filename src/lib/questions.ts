import { CreatorPack } from "@/types/game";

export const DEFAULT_PACKS: CreatorPack[] = [
  {
    id: "general-knowledge-official",
    title: "Đấu Trường Chuông Vàng - Toàn Diện",
    author: "Ban Tổ Chức (Official)",
    description: "Bộ câu hỏi chuẩn 15 câu thử thách tư duy, văn hóa, khoa học và đời sống.",
    price: 0,
    tags: ["Kiến thức chung", "Chính thức", "Hot"],
    playsCount: 1420,
    isOfficial: true,
    questions: [
      {
        id: 1,
        text: "Màu nào sau đây KHÔNG có trong dải màu cơ bản của cầu vồng?",
        options: ["Đỏ", "Hồng", "Lam", "Chàm"],
        correctAnswer: "B",
        timeLimit: 15,
        explanation: "7 sắc cầu vồng gồm: Đỏ, Cam, Vàng, Lục, Lam, Chàm, Tím. Hồng không thuộc dải quang phổ này.",
        difficulty: "easy"
      },
      {
        id: 2,
        text: "Hành tinh nào có kích thước lớn nhất trong Hệ Mặt Trời?",
        options: ["Sao Hỏa", "Sao Thổ", "Sao Mộc", "Sao Kim"],
        correctAnswer: "C",
        timeLimit: 15,
        explanation: "Sao Mộc (Jupiter) là hành tinh lớn nhất trong Hệ Mặt Trời.",
        difficulty: "easy"
      },
      {
        id: 3,
        text: "Đỉnh núi Fansipan được mệnh danh là nóc nhà của khu vực nào?",
        options: ["Đông Nam Á", "Đông Dương", "Châu Á", "Việt Nam và Lào"],
        correctAnswer: "B",
        timeLimit: 15,
        explanation: "Fansipan cao 3.143m, được mệnh danh là 'Nóc nhà Đông Dương'.",
        difficulty: "easy"
      },
      {
        id: 4,
        text: "Nguyên tố hóa học nào chiếm tỉ lệ khối lượng nhiều nhất trong cơ thể con người?",
        options: ["Cacbon", "Hydro", "Oxy", "Nitơ"],
        correctAnswer: "C",
        timeLimit: 15,
        explanation: "Oxy chiếm khoảng 65% khối lượng cơ thể người (chủ yếu cấu thành nước H2O).",
        difficulty: "medium"
      },
      {
        id: 5,
        text: "Ai là tác giả của tác phẩm văn học nổi tiếng 'Truyện Kiều'?",
        options: ["Nguyễn Trãi", "Nguyễn Du", "Hồ Xuân Hương", "Cao Bá Quát"],
        correctAnswer: "B",
        timeLimit: 15,
        explanation: "Đại thi hào Nguyễn Du là tác giả của Đoạn trường tân thanh (Truyện Kiều).",
        difficulty: "easy"
      },
      {
        id: 6,
        text: "Năm 1969, phi hành gia nào là người đầu tiên đặt chân lên Mặt Trăng?",
        options: ["Buzz Aldrin", "Yuri Gagarin", "Neil Armstrong", "Michael Collins"],
        correctAnswer: "C",
        timeLimit: 15,
        explanation: "Neil Armstrong là người đầu tiên bước xuống bề mặt Mặt Trăng trong sứ mệnh Apollo 11.",
        difficulty: "medium"
      },
      {
        id: 7,
        text: "Loài chim nào có khả năng bay lùi?",
        options: ["Chim ruồi", "Chim bói cá", "Chim én", "Chim cắt"],
        correctAnswer: "A",
        timeLimit: 15,
        explanation: "Chim ruồi là loài chim duy nhất có thể bay lùi và lộn ngược nhờ cấu tạo khớp cánh đặc biệt.",
        difficulty: "medium"
      },
      {
        id: 8,
        text: "Đơn vị đo lường cường độ dòng điện trong hệ đo lường quốc tế SI là gì?",
        options: ["Volt (V)", "Ohm (Ω)", "Ampe (A)", "Watt (W)"],
        correctAnswer: "C",
        timeLimit: 15,
        explanation: "Ampe (A) là đơn vị đo cường độ dòng điện.",
        difficulty: "medium"
      },
      {
        id: 9,
        text: "Thành phố nào được mệnh danh là 'Thành phố ngàn hoa' tại Việt Nam?",
        options: ["Sa Pa", "Đà Lạt", "Tam Đảo", "Đà Nẵng"],
        correctAnswer: "B",
        timeLimit: 15,
        explanation: "Đà Lạt (Lâm Đồng) nổi tiếng với khí hậu ôn hòa và muôn hoa đua sắc quanh năm.",
        difficulty: "easy"
      },
      {
        id: 10,
        text: "Bức tranh nàng 'Mona Lisa' của Leonardo da Vinci hiện đang được trưng bày tại bảo tàng nào?",
        options: ["Bảo tàng Louvre (Pháp)", "Bảo tàng Anh (UK)", "Bảo tàng Vatican", "Bảo tàng Prado (Tây Ban Nha)"],
        correctAnswer: "A",
        timeLimit: 15,
        explanation: "Mona Lisa hiện được bảo vệ nghiêm ngặt tại bảo tàng Louvre, thủ đô Paris, Pháp.",
        difficulty: "medium"
      },
      {
        id: 11,
        text: "Trận Bạch Đằng năm 938 do ai lãnh đạo đánh tan quân Nam Hán?",
        options: ["Trần Hưng Đạo", "Ngô Quyền", "Lê Hoàn", "Lý Thường Kiệt"],
        correctAnswer: "B",
        timeLimit: 15,
        explanation: "Ngô Quyền đã lãnh đạo trận Bạch Đằng năm 938 chấm dứt hơn 1000 năm Bắc thuộc.",
        difficulty: "medium"
      },
      {
        id: 12,
        text: "Số Pi (π) được xấp xỉ bằng phân số nào sau đây?",
        options: ["22/7", "25/8", "19/6", "31/10"],
        correctAnswer: "A",
        timeLimit: 15,
        explanation: "22/7 ≈ 3.142857..., là phân số xấp xỉ cổ điển và thông dụng nhất cho số Pi.",
        difficulty: "hard"
      },
      {
        id: 13,
        text: "Khí nào sau đây gây ra hiệu ứng nhà kính mạnh nhất theo lượng phát thải toàn cầu?",
        options: ["Metan (CH4)", "Carbon Dioxide (CO2)", "CFC", "Ozone (O3)"],
        correctAnswer: "B",
        timeLimit: 15,
        explanation: "CO2 chiếm hơn 70% tổng lượng khí nhà kính do con người thải ra.",
        difficulty: "hard"
      },
      {
        id: 14,
        text: "Tập hợp các số nguyên trong toán học thường được ký hiệu bằng chữ cái nào?",
        options: ["N", "Q", "Z", "R"],
        correctAnswer: "C",
        timeLimit: 15,
        explanation: "Ký hiệu Z xuất phát từ từ 'Zahlen' trong tiếng Đức, nghĩa là các con số.",
        difficulty: "hard"
      },
      {
        id: 15,
        text: "[CÂU HỎI RUNG CHUÔNG VÀNG] Bán kính Trái Đất ở xích đạo xấp xỉ bao nhiêu km?",
        options: ["Khoảng 4.200 km", "Khoảng 6.378 km", "Khoảng 8.500 km", "Khoảng 12.756 km"],
        correctAnswer: "B",
        timeLimit: 20,
        explanation: "Bán kính Trái Đất tại xích đạo xấp xỉ 6.378 km (đường kính xấp xỉ 12.756 km). Chúc mừng bạn đã chạm tay vào Chuông Vàng!",
        difficulty: "extreme"
      }
    ]
  },
  {
    id: "it-dev-vibecoding",
    title: "Thách Đấu Coder & VibeCoding",
    author: "DevSenior @techvn",
    description: "Bộ câu hỏi hài hước và thực chiến dành cho dân IT, VibeCoder và dân công nghệ.",
    price: 15000, // 15.000 VNĐ
    tags: ["Lập trình", "Hài hước", "Creator Pack"],
    playsCount: 680,
    isOfficial: false,
    questions: [
      {
        id: 1,
        text: "Trong JavaScript, biểu thức `typeof NaN` trả về kiểu dữ liệu gì?",
        options: ["'number'", "'undefined'", "'NaN'", "'object'"],
        correctAnswer: "A",
        timeLimit: 15,
        explanation: "Một trong những điểm dị của JS: NaN (Not-a-Number) lại có typeof là 'number'!",
        difficulty: "medium"
      },
      {
        id: 2,
        text: "Thuật ngữ 'Vibe Coding' do cựu giám đốc AI của Tesla nào khởi xướng?",
        options: ["Sam Altman", "Andrej Karpathy", "Ilya Sutskever", "Yann LeCun"],
        correctAnswer: "B",
        timeLimit: 15,
        explanation: "Andrej Karpathy đã tweet về khái niệm 'vibe coding' khi lập trình viên chỉ cần prompt và nạp vibe cho AI code.",
        difficulty: "medium"
      },
      {
        id: 3,
        text: "HTTP status code nào đại diện cho lỗi 'I'm a teapot' (Tôi là một ấm trà)?",
        options: ["404", "500", "418", "403"],
        correctAnswer: "C",
        timeLimit: 15,
        explanation: "HTTP 418 I'm a teapot là trò đùa cá tháng Tư năm 1998 của IETF trong chuẩn HTCPCP.",
        difficulty: "hard"
      },
      {
        id: 4,
        text: "Câu lệnh Git nào dùng để đổi lịch sử commit gần nhất mà không tạo commit mới?",
        options: ["git commit --amend", "git reset --hard", "git rebase -i", "git cherry-pick"],
        correctAnswer: "A",
        timeLimit: 15,
        explanation: "`git commit --amend` cho phép gộp các thay đổi mới vào commit gần nhất.",
        difficulty: "easy"
      },
      {
        id: 5,
        text: "[CÂU CHUÔNG VÀNG] Độ phức tạp trung bình của thuật toán QuickSort là bao nhiêu?",
        options: ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"],
        correctAnswer: "B",
        timeLimit: 15,
        explanation: "QuickSort có độ phức tạp trung bình là O(n log n), xấu nhất là O(n^2).",
        difficulty: "hard"
      }
    ]
  }
];
