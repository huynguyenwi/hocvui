import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  BookOpen, 
  Trophy, 
  User as UserIcon, 
  MessageCircle, 
  LayoutDashboard, 
  LogOut, 
  ChevronRight, 
  CheckCircle2, 
  XCircle,
  Play,
  RotateCcw,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { cn } from './lib/utils';
import { User, Subject, Topic, Question, LeaderboardEntry } from './types';

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateLocalScore: (points: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  const login = (token: string, user: User) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateLocalScore = (points: number) => {
    if (user) {
      const updated = { ...user, score: user.score + points };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateLocalScore }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// --- API Helpers ---
const API_URL = '/api';

// --- Shared Components ---
const Button = ({ children, className, onClick, disabled, variant = 'primary' }: any) => {
  const variants: any = {
    primary: 'bg-indigo-500 text-white font-bold shadow-[0_4px_0_#4338CA] hover:translate-y-[2px] hover:shadow-[0_2px_0_#4338CA]',
    secondary: 'bg-white text-indigo-600 border-2 border-indigo-100 font-bold shadow-[0_4px_0_#EEF2FF] hover:translate-y-[2px] hover:shadow-[0_2px_0_#EEF2FF]',
    amber: 'bg-amber-400 text-white font-bold shadow-[0_4px_0_#D97706] hover:translate-y-[2px] hover:shadow-[0_2px_0_#D97706]',
    green: 'bg-green-500 text-white font-bold shadow-[0_4px_0_#15803D] hover:translate-y-[2px] hover:shadow-[0_2px_0_#15803D]',
    danger: 'bg-rose-500 text-white font-bold shadow-[0_4px_0_#9F1239] hover:translate-y-[2px] hover:shadow-[0_2px_0_#9F1239]',
    ghost: 'bg-transparent text-indigo-600 hover:bg-indigo-50',
    white: 'bg-white text-indigo-600 font-black shadow-[0_6px_0_#C7D2FE] hover:shadow-none'
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={cn(
        'px-6 py-3 rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 uppercase tracking-tight text-sm',
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className, id, border = 'indigo' }: any) => {
  const borderColors: any = {
    indigo: 'border-indigo-100 shadow-[0_8px_0_#EEF2FF]',
    amber: 'border-[#FEF3C7] shadow-[0_8px_0_#FEF3C7]',
    green: 'border-[#DCFCE7] shadow-[0_8px_0_#DCFCE7]',
    slate: 'border-slate-100 shadow-[0_8px_0_#F1F5F9]',
  };

  return (
    <div 
      id={id} 
      className={cn(
        'bg-white rounded-[2.5rem] p-8 border-4 transition-all',
        borderColors[border],
        className
      )}
    >
      {children}
    </div>
  );
};

// --- Pages ---

// 1. Auth Page
const AuthPage = () => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/login' : '/register';
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      if (isLogin) {
        login(data.token, data.user);
      } else {
        setIsLogin(true);
        alert('Đăng ký thành công! Hãy đăng nhập.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50 p-4">
      <Card className="w-full max-w-md p-10" border="indigo">
        <div className="w-20 h-20 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-4xl mx-auto mb-6 shadow-[0_6px_0_#4338CA]">
          🎓
        </div>
        <h1 className="text-3xl font-black text-indigo-900 text-center mb-2 tracking-tight">STUDYJOY</h1>
        <p className="text-slate-500 text-center mb-8 font-medium italic">Học tập thật vui cùng bạn bè!</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-black text-indigo-900 uppercase tracking-widest ml-1">Tên đăng nhập</label>
            <input 
              type="text" 
              className="w-full p-4 rounded-2xl border-4 border-slate-50 bg-slate-50 focus:border-indigo-200 outline-none transition-all font-bold"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-black text-indigo-900 uppercase tracking-widest ml-1">Mật khẩu</label>
            <input 
              type="password" 
              className="w-full p-4 rounded-2xl border-4 border-slate-50 bg-slate-50 focus:border-indigo-200 outline-none transition-all font-bold"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-rose-500 text-sm text-center font-bold">{error}</p>}
          <Button className="w-full py-5 text-lg" variant="primary">
            {isLogin ? 'ĐĂNG NHẬP NGAY' : 'TẠO TÀI KHOẢN'}
          </Button>
        </form>
        <p className="mt-8 text-center text-slate-400 text-sm font-bold">
          {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'} 
          <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-600 underline ml-2">
            {isLogin ? 'Đăng ký' : 'Đăng nhập'}
          </button>
        </p>
      </Card>
    </div>
  );
};

// 2. Home Page
const HomePage = ({ onSelectSubject, onOpenChat, onOpenLeaderboard }: any) => {
  const { user, logout } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/subjects`)
      .then(res => res.json())
      .then(data => setSubjects(data));
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 pb-32">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800">Chào, {user?.username}! 👋</h2>
          <p className="text-slate-500 font-medium">Hôm nay chúng ta học môn gì nhỉ?</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white px-5 py-2 rounded-full border-2 border-yellow-400 flex items-center gap-2 shadow-sm">
            <span className="text-xl">⭐</span>
            <span className="font-black text-yellow-600">{user?.score || 0}</span>
          </div>
          <button onClick={logout} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
            <LogOut size={24} />
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-indigo-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="relative z-10 space-y-6 max-w-lg">
          <span className="bg-indigo-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Học tập vui vẻ</span>
          <h2 className="text-4xl md:text-5xl font-black leading-tight">Bạn đã sẵn sàng để trở thành thiên tài chưa?</h2>
          <p className="opacity-90 font-medium text-lg">Khám phá hàng ngàn kiến thức thú vị và thử thách bản thân ngay hôm nay.</p>
          <Button variant="white" className="text-lg px-10 py-4" onClick={onOpenChat}>
            <MessageCircle size={24} /> CHAT VỚI AI
          </Button>
        </div>
        <div className="relative z-10 w-full md:w-auto flex justify-center">
          <div className="text-[120px] opacity-20 transform rotate-12 select-none">✖️</div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl">🎓</div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500 rounded-full opacity-50 blur-3xl"></div>
      </section>

      {/* Subjects */}
      <section className="space-y-6">
        <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
          <span>📚</span> Môn Học Phổ Biến
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {subjects.map((subject, idx) => (
            <Card 
              key={subject.id} 
              border={idx % 2 === 0 ? 'amber' : 'green'}
              className="flex gap-6 items-center hover:translate-y-[-4px] cursor-pointer group"
              id={`subject-${subject.id}`}
            >
              <div 
                onClick={() => onSelectSubject(subject)}
                className={cn(
                  "w-24 h-24 rounded-[2rem] flex items-center justify-center text-5xl transition-transform group-hover:scale-110",
                  idx % 2 === 0 ? "bg-amber-100" : "bg-green-100"
                )}
              >
                {idx % 2 === 0 ? "📐" : "🔬"}
              </div>
              <div className="flex-grow space-y-2">
                <h3 className="text-2xl font-black text-slate-800">{subject.name}</h3>
                <p className="text-slate-500 font-bold uppercase text-xs">
                  {subject.level === 'primary' ? 'Tiểu học' : 'Trung học'} • 12 Chủ đề
                </p>
                <div onClick={() => onSelectSubject(subject)}>
                  <Button 
                    variant={idx % 2 === 0 ? 'amber' : 'green'}
                    className="mt-2"
                  >
                    Tiếp tục học
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

// 3. Topics Page
const TopicListPage = ({ subject, onSelectTopic, onBack }: any) => {
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/topics/${subject.id}`)
      .then(res => res.json())
      .then(data => setTopics(data));
  }, [subject.id]);

  // Group topics by grade
  const groupedTopics = topics.reduce((acc: any, topic) => {
    const grade = topic.grade || 1;
    if (!acc[grade]) acc[grade] = [];
    acc[grade].push(topic);
    return acc;
  }, {});

  const grades = Object.keys(groupedTopics).sort((a: any, b: any) => a - b);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Button variant="ghost" onClick={onBack}>&larr; QUAY LẠI</Button>
      <div>
        <h2 className="text-4xl font-black text-indigo-900 tracking-tight">{subject.name}</h2>
        <p className="text-slate-500 font-medium mt-1">Chọn lớp học và chủ đề để bắt đầu thử thách!</p>
      </div>

      <div className="space-y-10">
        {grades.length > 0 ? grades.map(grade => (
          <div key={grade} className="space-y-4">
            <h3 className="text-xl font-black text-indigo-600 flex items-center gap-2">
              <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-sm">L</span> 
              LỚP {grade}
            </h3>
            <div className="grid gap-4">
              {groupedTopics[grade].map((topic: Topic) => (
                <Card key={topic.id} className="flex justify-between items-center hover:bg-indigo-50/50 cursor-pointer group border-2 border-slate-100 hover:border-indigo-200" id={`topic-${topic.id}`} border="slate">
                  <div onClick={() => onSelectTopic(topic)} className="flex-1">
                    <h4 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{topic.name}</h4>
                    <p className="text-sm text-slate-400 font-medium line-clamp-1 mt-1">{topic.theory}</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <Play size={20} fill="currentColor" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )) : (
          <div className="p-12 text-center text-slate-400 font-bold border-4 border-dashed border-slate-100 rounded-[2.5rem]">
            Môn học này hiện chưa có chủ đề nào.
          </div>
        )}
      </div>
    </div>
  );
};

// 4. Quiz Page
const QuizPage = ({ topic, onBack }: any) => {
  const { token, updateLocalScore } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/questions/${topic.id}`)
      .then(res => res.json())
      .then(data => {
        console.log("Quiz data fetched:", data);
        setQuestions(data);
        setLoading(false);
      });
  }, [topic.id]);

  const handleAnswer = async () => {
    if (!selectedOption) return;
    const isCorrect = selectedOption === questions[currentIdx].correctAnswer;
    if (isCorrect) {
      setScore(s => s + 10);
      try {
        await fetch(`${API_URL}/update-score`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ points: 10 }),
        });
        updateLocalScore(10);
      } catch (e) { console.error(e); }
    }
    setShowFeedback(true);
  };

  const nextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(i => i + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      setIsFinished(true);
    }
  };

  if (loading) return <div className="text-center p-12 text-indigo-600 font-bold">Đang tải câu hỏi...</div>;
  if (questions.length === 0) return <div className="text-center p-12">Chủ đề này chưa có câu hỏi. <Button onClick={onBack}>Quay lại</Button></div>;

  if (isFinished) {
    return (
      <div className="max-w-md mx-auto p-6 mt-12">
        <Card className="text-center space-y-8" border="amber">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto text-5xl">🏆</div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-indigo-900">Hoàn Thành!</h2>
            <p className="text-slate-500 font-medium italic">Bạn đã làm rất tốt em nhé!</p>
          </div>
          <div className="bg-indigo-50 p-6 rounded-[2rem] border-2 border-indigo-100">
             <p className="text-sm font-bold text-indigo-400 uppercase">Điểm của bạn</p>
             <p className="text-5xl font-black text-indigo-600">{score}</p>
          </div>
          <div className="flex flex-col gap-3">
            <Button className="w-full text-lg py-4" onClick={() => { setCurrentIdx(0); setScore(0); setIsFinished(false); setSelectedOption(null); setShowFeedback(false); }}>
              <RotateCcw size={20} /> LÀM LẠI
            </Button>
            <Button className="w-full text-lg py-4" variant="secondary" onClick={onBack}>VỀ TRANG CHỦ</Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  if (!currentQ || !currentQ.options) return <div className="text-center p-12 font-bold text-rose-500">Lỗi dữ liệu: Câu hỏi lỗi (không có đáp án). <Button onClick={onBack}>Quay lại</Button></div>;

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">Đang diễn ra</span>
          <h2 className="text-3xl font-black text-slate-800 mt-2">Quiz: {topic.name}</h2>
        </div>
        <div className="text-right">
           <p className="text-xs font-bold text-slate-400 uppercase">Tiến trình</p>
           <p className="text-xl font-black text-indigo-600">{currentIdx + 1}/{questions.length}</p>
        </div>
      </div>
      
      <div className="h-6 w-full bg-white border-4 border-slate-100 rounded-full overflow-hidden shadow-inner p-1">
        <motion.div 
          className="h-full bg-indigo-500 rounded-full" 
          initial={{ width: 0 }}
          animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        />
      </div>

      <Card className="p-10" border="slate">
        <h3 className="text-2xl md:text-3xl font-black text-slate-800 mb-10 leading-snug">{currentQ.question}</h3>
        <div className="grid gap-4">
          {currentQ.options.map((opt, idx) => (
            <button
              key={`${idx}-${opt}`}
              disabled={showFeedback}
              onClick={() => setSelectedOption(opt)}
              className={cn(
                "p-5 text-left rounded-[1.5rem] border-4 transition-all flex justify-between items-center group relative overflow-hidden",
                selectedOption === opt ? "border-indigo-500 bg-indigo-50" : "border-slate-50 bg-slate-50 hover:border-indigo-200",
                showFeedback && opt === currentQ.correctAnswer ? "border-green-500 bg-green-50" : "",
                showFeedback && selectedOption === opt && opt !== currentQ.correctAnswer ? "border-rose-500 bg-rose-50" : ""
              )}
            >
              <div className="flex items-center gap-4 relative z-10">
                <span className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-black",
                  selectedOption === opt ? "bg-indigo-500 text-white" : "bg-white text-slate-400"
                )}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="font-bold text-lg text-slate-700">{opt || "Lỗi nội dung!"}</span>
              </div>
              {showFeedback && opt === currentQ.correctAnswer && <div className="text-3xl">✅</div>}
              {showFeedback && selectedOption === opt && opt !== currentQ.correctAnswer && <div className="text-3xl">❌</div>}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {showFeedback && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-10 p-6 bg-orange-50 rounded-[2rem] border-4 border-orange-100"
            >
              <p className="text-sm font-black text-orange-600 uppercase mb-2">💡 Giải thích từ thầy cô:</p>
              <p className="text-lg text-slate-700 leading-relaxed font-medium">{currentQ.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 flex justify-end">
          {!showFeedback ? (
            <Button onClick={handleAnswer} disabled={!selectedOption} className="px-10 py-5 text-lg" variant="primary">KIỂM TRA &rarr;</Button>
          ) : (
            <Button onClick={nextQuestion} className="px-10 py-5 text-lg" variant="primary">TIẾP THEO &rarr;</Button>
          )}
        </div>
      </Card>
    </div>
  );
};

// 5. Leaderboard
const LeaderboardPage = ({ onBack }: any) => {
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/leaderboard`)
      .then(res => res.json())
      .then(data => setBoard(data));
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <Button variant="ghost" onClick={onBack}>&larr; QUAY LẠI</Button>
      <Card className="p-0 overflow-hidden" border="amber">
        <div className="bg-amber-400 p-10 text-center text-white border-b-4 border-amber-500 shadow-inner">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4 text-5xl">🏆</div>
          <h2 className="text-4xl font-black uppercase tracking-tighter">Bảng Xếp Hạng</h2>
          <p className="opacity-80 font-bold mt-1">Top các thiên tài của StudyJoy!</p>
        </div>
        <div className="divide-y-4 divide-slate-50">
          {board.map((entry, i) => (
            <div key={i} className="p-6 flex items-center justify-between hover:bg-amber-50/30 transition-colors">
              <div className="flex items-center gap-5">
                <span className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm",
                  i === 0 ? "bg-yellow-400 text-white shadow-[0_4px_0_#D97706]" : 
                  i === 1 ? "bg-slate-200 text-slate-600" : 
                  i === 2 ? "bg-orange-200 text-orange-700" : "bg-indigo-50 text-indigo-300"
                )}>
                  {i + 1}
                </span>
                <span className="font-extrabold text-indigo-900 text-lg">{entry.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-black text-indigo-600 text-xl">{entry.score}</span>
                <span className="text-xs font-black text-amber-500 uppercase">sao</span>
              </div>
            </div>
          ))}
          {board.length === 0 && <div className="p-12 text-center text-slate-400 font-bold">Chưa có ai tham gia cả. Hãy là người đầu tiên!</div>}
        </div>
      </Card>
    </div>
  );
};

// 6. Admin Dashboard
const AdminPage = ({ onBack }: any) => {
  const { token } = useAuth();
  const [view, setView] = useState<'subjects' | 'topics' | 'questions'>('subjects');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const [selectedSub, setSelectedSub] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  const [newSubject, setNewSubject] = useState({ name: '', level: 'primary' });
  const [newTopic, setNewTopic] = useState({ subjectId: '', grade: 1, name: '', theory: '', example: '' });
  const [newQuestion, setNewQuestion] = useState({ topicId: '', question: '', options: ['', '', '', ''], correctAnswer: '', explanation: '' });
  
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  const fetchData = async () => {
    try {
      const s = await fetch(`${API_URL}/subjects`).then(r => r.json());
      setSubjects(s);
      if (selectedSub) {
        const t = await fetch(`${API_URL}/topics/${selectedSub}`).then(r => r.json());
        setTopics(t);
      } else {
        setTopics([]);
      }
      if (selectedTopic) {
        const q = await fetch(`${API_URL}/questions/${selectedTopic}`).then(r => r.json());
        setQuestions(q);
      } else {
        setQuestions([]);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, [selectedSub, selectedTopic, view]);

  const handleAddSubject = async () => {
    await fetch(`${API_URL}/admin/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(newSubject),
    });
    setNewSubject({ name: '', level: 'primary' });
    fetchData();
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteSubject = async (id: string) => {
    if (deletingId !== id) {
      setDeletingId(id);
      setTimeout(() => setDeletingId(null), 3000);
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/admin/subjects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
        setSelectedSub(''); 
        setDeletingId(null);
      } else {
        const err = await res.json();
        alert(`Lỗi: ${err.error || 'Kiểm tra quyền admin'}`);
      }
    } catch (e) {
      console.error(e);
      alert('Lỗi kết nối máy chủ.');
    }
  };

  const handleAddTopic = async () => {
    if (!newTopic.name || !selectedSub) return;
    await fetch(`${API_URL}/admin/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ ...newTopic, subjectId: selectedSub }),
    });
    setNewTopic({ subjectId: '', grade: 1, name: '', theory: '', example: '' });
    fetchData();
  };

  const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null);
  const handleDeleteTopic = async (id: string) => {
    if (deletingTopicId !== id) {
      setDeletingTopicId(id);
      setTimeout(() => setDeletingTopicId(null), 3000);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/admin/topics/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
        setSelectedTopic('');
        setDeletingTopicId(null);
      }
    } catch (e) { console.error(e); }
  };

  const handleSaveQuestion = async () => {
    const method = editingQuestion ? 'PUT' : 'POST';
    const url = editingQuestion ? `${API_URL}/questions/${editingQuestion.id}` : `${API_URL}/questions`;
    const payload = editingQuestion ? editingQuestion : { ...newQuestion, topicId: selectedTopic };

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    
    setEditingQuestion(null);
    setNewQuestion({ topicId: '', question: '', options: ['', '', '', ''], correctAnswer: '', explanation: '' });
    fetchData();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 pb-32">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none">Quản Lý Hệ Thống</h2>
            <p className="text-slate-500 font-bold text-xs uppercase mt-1 tracking-widest">Admin Dashboard</p>
          </div>
        </div>
        <Button variant="secondary" onClick={onBack}>Quay lại</Button>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        {[
          { id: 'subjects', label: 'Môn Học', icon: BookOpen },
          { id: 'topics', label: 'Chủ Đề', icon: Play },
          { id: 'questions', label: 'Câu Hỏi', icon: CheckCircle2 }
        ].map((tab: any) => (
          <button 
            key={tab.id}
            onClick={() => setView(tab.id)} 
            className={cn(
              "px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition-all",
              view === tab.id ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {view === 'subjects' && (
        <div className="space-y-6">
          <Card className="max-w-2xl">
            <h3 className="font-black text-xl text-slate-800 mb-6">Thêm Môn Học Mới</h3>
            <div className="space-y-4">
              <input 
                placeholder="Tên môn học (Ví dụ: Toán Học)" 
                className="w-full p-4 rounded-xl border-2 border-slate-100 outline-none focus:border-indigo-500 font-bold"
                value={newSubject.name}
                onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
              />
              <select 
                className="w-full p-4 rounded-xl border-2 border-slate-100 font-bold outline-none"
                value={newSubject.level}
                onChange={(e) => setNewSubject({...newSubject, level: e.target.value})}
              >
                <option value="primary">Cấp 1 (Tiểu học)</option>
                <option value="secondary">Cấp 2 (Trung học cơ sở)</option>
                <option value="high">Cấp 3 (Trung học phổ thông)</option>
              </select>
              <Button onClick={handleAddSubject} disabled={!newSubject.name} className="w-full py-4">Thêm Môn Học</Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map(s => (
              <Card key={s.id} className="flex justify-between items-center py-6 border-slate">
                <div>
                  <h4 className="font-black text-xl text-indigo-900">{s.name}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.level === 'primary' ? 'Tiểu học' : s.level === 'secondary' ? 'THCS' : 'THPT'}</p>
                </div>
                <button 
                  onClick={() => handleDeleteSubject(s.id)} 
                  className={cn(
                    "p-3 rounded-2xl transition-all shadow-sm flex items-center gap-2",
                    deletingId === s.id ? "bg-rose-500 text-white animate-pulse" : "bg-rose-50 hover:bg-rose-100 text-rose-500"
                  )}
                  title="Xóa môn học"
                >
                  {deletingId === s.id ? <span className="text-[10px] font-black uppercase">Xác nhận xóa?</span> : <Trash2 size={20} />}
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {view === 'topics' && (
        <div className="space-y-6">
           <Card className="max-w-2xl">
            <h3 className="font-black text-xl text-slate-800 mb-6">Thêm Chủ Đề Mới</h3>
            <div className="space-y-4">
              <select className="w-full p-4 rounded-xl border-2 border-slate-100 font-bold outline-none" value={selectedSub} onChange={(e) => setSelectedSub(e.target.value)}>
                <option value="">Chọn môn học</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input 
                placeholder="Tên chủ đề" 
                className="w-full p-4 rounded-xl border-2 border-slate-100 outline-none focus:border-indigo-500 font-bold"
                value={newTopic.name}
                onChange={(e) => setNewTopic({...newTopic, name: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" 
                  placeholder="Khối lớp (1-12)" 
                  className="p-4 rounded-xl border-2 border-slate-100 outline-none font-bold"
                  value={newTopic.grade}
                  onChange={(e) => setNewTopic({...newTopic, grade: parseInt(e.target.value)})}
                />
              </div>
              <textarea 
                placeholder="Lý thuyết ngắn gọn" 
                className="w-full p-4 rounded-xl border-2 border-slate-100 outline-none font-medium h-24"
                value={newTopic.theory}
                onChange={(e) => setNewTopic({...newTopic, theory: e.target.value})}
              />
              <Button onClick={handleAddTopic} disabled={!selectedSub || !newTopic.name} className="w-full py-4">Thêm Chủ Đề</Button>
            </div>
          </Card>

          <div className="space-y-4">
            <select className="w-full p-4 rounded-xl border-4 border-indigo-100 font-black text-lg text-indigo-900 outline-none" value={selectedSub} onChange={(e) => setSelectedSub(e.target.value)}>
              <option value="">Lọc theo môn học để xem danh sách</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <div className="grid gap-4">
              {topics.map(t => (
                <Card key={t.id} className="flex justify-between items-center py-6 border-slate">
                  <div>
                    <h4 className="font-black text-xl text-slate-800">{t.name} <span className="text-indigo-400 text-sm ml-2">Lớp {t.grade}</span></h4>
                    <p className="text-sm text-slate-400 font-medium line-clamp-1">{t.theory}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteTopic(t.id)} 
                    className={cn(
                      "p-3 rounded-2xl transition-all shadow-sm flex items-center gap-2",
                      deletingTopicId === t.id ? "bg-rose-500 text-white animate-pulse" : "bg-rose-50 hover:bg-rose-100 text-rose-500"
                    )}
                    title="Xóa chủ đề"
                  >
                    {deletingTopicId === t.id ? <span className="text-[10px] font-black uppercase">Chắc chắn?</span> : <Trash2 size={20} />}
                  </button>
                </Card>
              ))}
              {selectedSub && topics.length === 0 && <p className="text-center p-8 text-slate-400 font-bold border-4 border-dashed rounded-3xl">Chưa có chủ đề nào.</p>}
            </div>
          </div>
        </div>
      )}

      {view === 'questions' && (
        <div className="space-y-6">
          <Card className="max-w-4xl">
            <h3 className="font-black text-xl text-slate-800 mb-6">{editingQuestion ? 'Cập Nhật Câu Hỏi' : 'Thêm Câu Hỏi Mới'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
               <select className="p-4 rounded-xl border-2 border-slate-100 font-bold" value={selectedSub} onChange={(e) => setSelectedSub(e.target.value)}>
                  <option value="">Môn học</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
               </select>
               <select className="p-4 rounded-xl border-2 border-slate-100 font-bold" value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
                  <option value="">Chủ đề</option>
                  {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
               </select>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nội dung câu hỏi</label>
                <textarea 
                  className="w-full p-4 border-2 border-slate-100 rounded-xl font-bold h-24 outline-none focus:border-indigo-500"
                  value={editingQuestion ? editingQuestion.question : newQuestion.question}
                  onChange={(e) => {
                    const val = e.target.value;
                    editingQuestion ? setEditingQuestion({...editingQuestion, question: val}) : setNewQuestion({...newQuestion, question: val})
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(editingQuestion ? editingQuestion.options : newQuestion.options).map((opt: string, i: number) => (
                  <div key={i} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lựa chọn {i + 1}</label>
                    <input 
                      className="w-full p-4 border-2 border-slate-100 rounded-xl font-medium"
                      value={opt}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (editingQuestion) {
                          const next = [...editingQuestion.options];
                          next[i] = val;
                          setEditingQuestion({...editingQuestion, options: next});
                        } else {
                          const next = [...newQuestion.options];
                          next[i] = val;
                          setNewQuestion({...newQuestion, options: next});
                        }
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Đáp án đúng</label>
                  <select 
                    className="w-full p-4 border-2 border-slate-100 rounded-xl font-bold"
                    value={editingQuestion ? editingQuestion.correctAnswer : newQuestion.correctAnswer}
                    onChange={(e) => {
                      const val = e.target.value;
                      editingQuestion ? setEditingQuestion({...editingQuestion, correctAnswer: val}) : setNewQuestion({...newQuestion, correctAnswer: val})
                    }}
                  >
                    <option value="">Chọn đáp án phù hợp</option>
                    {(editingQuestion ? editingQuestion.options : newQuestion.options).map((opt: string, i: number) => (
                      <option key={i} value={opt}>{opt || `Lựa chọn ${i+1}`}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Lời giải chi tiết</label>
                  <input 
                    className="w-full p-4 border-2 border-slate-100 rounded-xl font-medium"
                    value={editingQuestion ? editingQuestion.explanation : newQuestion.explanation}
                    onChange={(e) => {
                      const val = e.target.value;
                      editingQuestion ? setEditingQuestion({...editingQuestion, explanation: val}) : setNewQuestion({...newQuestion, explanation: val})
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSaveQuestion} disabled={!selectedTopic || !(editingQuestion ? editingQuestion.question : newQuestion.question)} className="flex-1 py-5 text-lg">
                  {editingQuestion ? 'CẬP NHẬT CÂU HỎI' : 'LƯU CÂU HỎI'}
                </Button>
                {editingQuestion && <Button variant="secondary" onClick={() => setEditingQuestion(null)} className="px-10">HỦY</Button>}
              </div>
            </div>
          </Card>

          <div className="space-y-4">
             <div className="bg-indigo-600 p-6 rounded-3xl text-white flex justify-between items-center shadow-lg">
                <div>
                   <h3 className="text-xl font-black">{questions.length} Câu Hỏi</h3>
                   <p className="text-indigo-200 text-xs font-black uppercase tracking-widest">Danh sách hiện tại</p>
                </div>
                <div className="text-sm font-bold opacity-80 italic">Chủ đề: {topics.find(t => t.id === selectedTopic)?.name || 'Chưa chọn'}</div>
             </div>
             
             <div className="grid gap-4">
              {questions.map(q => (
                <Card key={q.id} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-6 border-slate">
                  <div className="flex-1">
                    <p className="font-black text-slate-800 text-lg leading-snug">{q.question}</p>
                    <div className="flex gap-4 mt-2">
                      <span className="text-xs font-black text-green-600 uppercase bg-green-50 px-2 py-1 rounded-lg border border-green-100">Đúng: {q.correctAnswer}</span>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => { setEditingQuestion(q); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                      className="flex-1 md:flex-none bg-indigo-50 text-indigo-600 p-3 rounded-2xl hover:bg-indigo-100 transition-colors shadow-sm"
                      title="Sửa câu hỏi"
                    >
                      <Edit size={20} />
                    </button>
                    <button 
                      className={cn(
                        "flex-1 md:flex-none p-3 rounded-2xl transition-all shadow-sm flex items-center gap-2",
                        deletingId === q.id ? "bg-rose-500 text-white animate-pulse" : "bg-rose-50 hover:bg-rose-100 text-rose-500"
                      )}
                      title="Xóa câu hỏi"
                      onClick={async () => {
                        if (deletingId !== q.id) {
                          setDeletingId(q.id);
                          setTimeout(() => setDeletingId(null), 3000);
                          return;
                        }
                        try {
                          const res = await fetch(`${API_URL}/questions/${q.id}`, { 
                            method: 'DELETE', 
                            headers: { 'Authorization': `Bearer ${token}` } 
                          });
                          if (res.ok) {
                            fetchData();
                            setDeletingId(null);
                          } else {
                            alert('Lỗi: Không thể xóa câu hỏi.');
                          }
                        } catch (e) { 
                          console.error(e); 
                          alert('Lỗi kết nối khi xóa câu hỏi.');
                        }
                      }}
                    >
                      {deletingId === q.id ? <span className="text-[10px] font-black uppercase">Xóa?</span> : <Trash2 size={20} />}
                    </button>
                  </div>
                </Card>
              ))}
              {!selectedTopic && <p className="text-center p-12 text-slate-400 font-bold border-4 border-dashed rounded-[2.5rem]">Vui lòng chọn môn học và chủ đề để xem câu hỏi.</p>}
              {selectedTopic && questions.length === 0 && <p className="text-center p-12 text-slate-400 font-bold border-4 border-dashed rounded-[2.5rem]">Không có câu hỏi nào trong chủ đề này.</p>}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};


// 7. AI Chatbot (Floating Widget)
const ChatAI = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([
    { role: 'ai', text: 'Chào em! Anh là AI hỗ trợ học tập. Em có câu hỏi nào về bài học không?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const aiToken = process.env.GEMINI_API_KEY;
      if (!aiToken) throw new Error('API key missing');
      
      const genAI = new GoogleGenAI({ apiKey: aiToken });
      const model = "gemini-3-flash-preview";
      
      const result = await genAI.models.generateContent({
        model,
        contents: userMsg,
        config: {
           systemInstruction: "Bạn là một gia sư AI cổ điển, thân thiện cho trẻ em Việt Nam. Hãy giải thích ngắn gọn, khích lệ và dùng ngôn ngữ phù hợp lứa tuổi học sinh."
        }
      });

      setMessages(prev => [...prev, { role: 'ai', text: result.text || "Xin lỗi, anh gặp chút lỗi nhỏ. Hãy thử lại nhé!" }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: "Anh đang bận chút việc, em hỏi lại sau nhé!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 100, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.5 }}
          className="fixed bottom-28 right-8 w-80 h-[450px] z-[60] flex flex-col"
        >
          <Card className="flex-1 flex flex-col p-0 overflow-hidden" border="indigo">
            {/* Chat Header */}
            <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shadow-md">
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">🤖</div>
                 <span className="font-black text-sm uppercase tracking-wider">Gia Sư AI</span>
               </div>
               <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                 <XCircle size={20} />
               </button>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 shadow-inner">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] p-3 rounded-2xl text-sm font-medium",
                    m.role === 'user' ? "bg-indigo-500 text-white rounded-tr-none shadow-sm" : "bg-white text-slate-700 border border-indigo-100 rounded-tl-none shadow-sm"
                  )}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && <div className="text-[10px] font-black text-indigo-400 animate-pulse ml-1 uppercase">AI đang gõ...</div>}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-indigo-50 flex gap-2">
              <input 
                className="flex-1 bg-slate-50 p-3 rounded-xl text-sm font-bold border-2 border-transparent focus:border-indigo-500 outline-none"
                placeholder="Hỏi anh AI nhé..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend} 
                disabled={loading}
                className="bg-indigo-600 text-white p-2 rounded-xl active:scale-90 transition-transform disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- App Shell ---
const AppContent = () => {
  const { user } = useAuth();
  const [page, setPage] = useState<'home' | 'topics' | 'quiz' | 'leaderboard' | 'admin'>('home');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  if (!user) return <AuthPage />;

  return (
    <div className="min-h-screen bg-indigo-50 pb-20">
      <AnimatePresence mode="wait">
        {page === 'home' && (
          <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <HomePage 
              onSelectSubject={(s: Subject) => { setSelectedSub(s); setPage('topics'); }} 
              onOpenChat={() => setIsChatOpen(!isChatOpen)}
              onOpenLeaderboard={() => setPage('leaderboard')}
            />
          </motion.div>
        )}
        {page === 'topics' && selectedSub && (
          <motion.div key="topics" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <TopicListPage 
              subject={selectedSub} 
              onSelectTopic={(t: Topic) => { setSelectedTopic(t); setPage('quiz'); }} 
              onBack={() => setPage('home')} 
            />
          </motion.div>
        )}
        {page === 'quiz' && selectedTopic && (
          <motion.div key="quiz" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
            <QuizPage topic={selectedTopic} onBack={() => { setPage('home'); setSelectedTopic(null); }} />
          </motion.div>
        )}
        {page === 'leaderboard' && (
          <motion.div key="leaderboard" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}>
            <LeaderboardPage onBack={() => setPage('home')} />
          </motion.div>
        )}
        {page === 'admin' && (
          <motion.div key="admin">
            <AdminPage onBack={() => setPage('home')} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating AI Assistant Widget */}
      <ChatAI isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Floating Bottom Nav */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-6 bg-white border-4 border-indigo-100 px-8 py-4 rounded-[2rem] shadow-[0_12px_24px_rgba(79,70,229,0.15)] z-50 items-center">
        <button 
          onClick={() => { setPage('home'); setIsChatOpen(false); }} 
          className={cn(
            "p-3 rounded-2xl transition-all flex flex-col items-center gap-1", 
            page === 'home' || page === 'topics' || page === 'quiz' ? "bg-indigo-500 text-white shadow-[0_4px_0_#4338CA]" : "text-slate-400 hover:bg-slate-50"
          )}
        >
          <BookOpen size={24} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Trang chủ</span>
        </button>
        <button 
          onClick={() => { setPage('leaderboard'); setIsChatOpen(false); }} 
          className={cn(
            "p-3 rounded-2xl transition-all flex flex-col items-center gap-1", 
            page === 'leaderboard' ? "bg-indigo-500 text-white shadow-[0_4px_0_#4338CA]" : "text-slate-400 hover:bg-slate-50"
          )}
        >
          <Trophy size={24} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Xếp hạng</span>
        </button>
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)} 
          className={cn(
            "p-3 rounded-2xl transition-all flex flex-col items-center gap-1", 
            isChatOpen ? "bg-indigo-600 text-white shadow-[0_4px_0_#4338CA]" : "text-slate-400 hover:bg-slate-50 relative group"
          )}
        >
          <MessageCircle size={24} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Chat AI</span>
          {!isChatOpen && <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-bounce" />}
        </button>
        {user.role === 'admin' && (
          <button 
            onClick={() => { setPage('admin'); setIsChatOpen(false); }} 
            className={cn(
              "p-3 rounded-2xl transition-all flex flex-col items-center gap-1", 
              page === 'admin' ? "bg-indigo-500 text-white shadow-[0_4px_0_#4338CA]" : "text-slate-400 hover:bg-slate-50"
            )}
          >
            <LayoutDashboard size={24} />
            <span className="text-[10px] font-black uppercase tracking-tighter">Quản lý</span>
          </button>
        )}
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
