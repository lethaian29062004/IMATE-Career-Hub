import React from "react";
import { useNavigate } from "react-router-dom";
import { Brain, MessageSquare } from "lucide-react";
import { useAuth } from "@/store/AuthContext";

import interviewImg from "@/assets/images/interview.webp";
import testImg from "@/assets/images/test.webp";

const PracticeWithAI: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleClick = (path: string) => {
    if (!user) {
      navigate("/sign-in");
    } else {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white px-6 pt-16 pb-24">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-14">
          <h1 className="inline-block text-4xl md:text-5xl font-extrabold mb-4 pb-1 leading-[1.2] bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
            Luyện tập cùng AI
          </h1>
          <p className="text-slate-400">
            Chọn hình thức luyện tập phù hợp với bạn
          </p>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* TEST */}
          <div
            onClick={() => handleClick("/practice-test")}
            className="cursor-pointer rounded-3xl border border-white/10 bg-[#1e293b]/40 hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300"
          >
            {/* IMAGE */}
            <div className="p-4">
              <img
                src={testImg}
                alt="Test"
                className="w-full aspect-video object-cover rounded-2xl"
              />
            </div>

            {/* CONTENT */}
            <div className="px-6 pb-6 flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-indigo-500/20">
                <Brain className="text-indigo-400" />
              </div>

              <div className="flex-1">
                <p className="text-lg font-semibold">
                  Làm bài test năng lực
                </p>
                <p className="text-sm text-slate-400">
                  Kiểm tra kỹ năng với AI
                </p>
              </div>
            </div>
          </div>

          {/* INTERVIEW */}
          <div
            onClick={() => handleClick("/interview-setup")}
            className="cursor-pointer rounded-3xl border border-white/10 bg-[#1e293b]/40 hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300"
          >
            {/* IMAGE */}
            <div className="p-4">
              <img
                src={interviewImg}
                alt="Interview"
                className="w-full aspect-video object-cover rounded-2xl"
              />
            </div>

            {/* CONTENT */}
            <div className="px-6 pb-6 flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-purple-500/20">
                <MessageSquare className="text-purple-400" />
              </div>

              <div className="flex-1">
                <p className="text-lg font-semibold">
                  Phỏng vấn cùng AI
                </p>
                <p className="text-sm text-slate-400">
                  Trải nghiệm phỏng vấn thực tế
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PracticeWithAI;