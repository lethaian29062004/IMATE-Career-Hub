import React, { useState, useEffect } from "react";
import { X, Check, ChevronsUpDown, Loader2, Info } from "lucide-react";
import { getAllPositions, getAllSkills } from "@/services/commonService";
import type { PositionItem, SkillItem } from "@/types/common/question";
import { Badge } from "@/components/ui/badge";
import { CreateJobPost } from "@/services/recruiterService";
import { toast } from "react-toastify";
import { MSG52, MSG53 } from "@/constants/messages";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";

const CreateJobApplication: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (isAuthLoading) return;
    if (user && user.accountStatus === "PendingVerification" && user.verificationStatus !== "Rejected" && user.companyName) {
      navigate("/recruiter-pending-application", { replace: true });
    }
  }, [user, isAuthLoading, navigate]);

  const [form, setForm] = useState({
    title: "",
    employmentType: "Full-time",
    location: "",
    minSalary: "",
    maxSalary: "",
    description: "",
    applicationDeadline: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPositions, setSelectedPositions] = useState<PositionItem[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<SkillItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [availablePositions, setAvailablePositions] = useState<PositionItem[]>([]);
  const [availableSkills, setAvailableSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [positionSearch, setPositionSearch] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const [showPositionDropdown, setShowPositionDropdown] = useState(false);
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [positionsRes, skillsRes] = await Promise.all([
          getAllPositions({ pageSize: 100, isActive: true }),
          getAllSkills({ pageSize: 100 }),
        ]);
        setAvailablePositions(positionsRes.data);
        setAvailableSkills(skillsRes.data);
        console.log("Fetched skillsRes:", skillsRes);
      } catch (error) {
        console.error("Failed to fetch skills/positions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    // Clear error for the field being edited
    if (errors[e.target.name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[e.target.name];
        return newErrors;
      });
    }
  };

  const togglePosition = (pos: PositionItem) => {
    if (selectedPositions.find(p => p.id === pos.id)) {
      setSelectedPositions(selectedPositions.filter(p => p.id !== pos.id));
    } else {
      setSelectedPositions([...selectedPositions, pos]);
    }
    setPositionSearch("");
    // Clear position error if a position is added
    if (errors.positions) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.positions;
        return newErrors;
      });
    }
  };

  const toggleSkill = (skill: SkillItem) => {
    if (selectedSkills.find(s => s.id === skill.id)) {
      setSelectedSkills(selectedSkills.filter(s => s.id !== skill.id));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
    setSkillSearch("");
    // Clear skill error if a skill is added
    if (errors.skills) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.skills;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.title.trim()) newErrors.title = "Vui lòng nhập tiêu đề công việc";
    if (selectedPositions.length === 0) newErrors.positions = "Vui lòng chọn ít nhất một vị trí";
    if (!form.location.trim()) newErrors.location = "Vui lòng nhập địa điểm làm việc";
    if (selectedSkills.length === 0) newErrors.skills = "Vui lòng chọn ít nhất một kỹ năng";
    
    if (!form.minSalary) {
      newErrors.minSalary = "Vui lòng nhập lương tối thiểu";
    } else if (Number(form.minSalary) < 0) {
      newErrors.minSalary = "Lương không thể âm";
    }

    if (!form.maxSalary) {
      newErrors.maxSalary = "Vui lòng nhập lương tối đa";
    } else if (Number(form.maxSalary) < 0) {
      newErrors.maxSalary = "Lương không thể âm";
    }

    if (form.minSalary && form.maxSalary && Number(form.minSalary) > Number(form.maxSalary)) {
      newErrors.maxSalary = "Lương tối đa phải lớn hơn lương tối thiểu";
    }

    if (!form.applicationDeadline) newErrors.applicationDeadline = "Vui lòng chọn hạn chót ứng tuyển";
    
    // Check if deadline is in the past
    if (form.applicationDeadline) {
      const today = new Date().toISOString().split("T")[0];
      if (form.applicationDeadline < today) {
        newErrors.applicationDeadline = "Hạn chót không thể ở quá khứ";
      }
    }

    if (!form.description.trim()) newErrors.description = "Vui lòng nhập mô tả công việc";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin nhập liệu");
      return;
    }

    try {
      const payload = {
        ...form,
        JobPositions: selectedPositions.map(p => p.id),
        JobSkills: selectedSkills.map(s => s.id),
      };
      setIsSubmitting(true);

      await CreateJobPost(payload);
      setIsSubmitting(false);

      toast.success(MSG52);

      // reset form
      setForm({
        title: "",
        employmentType: "Full-time",
        location: "",
        minSalary: "",
        maxSalary: "",
        description: "",
        applicationDeadline: "",
      });

      // clear positions + skills
      setSelectedPositions([]);
      setSelectedSkills([]);

      setPositionSearch("");
      setSkillSearch("");
      setErrors({});

    } catch (error) {
      console.error(error);
      toast.error(MSG53);
      setIsSubmitting(false);

    }
  };

  const filteredPositions = availablePositions.filter(p =>
    p.name.toLowerCase().includes(positionSearch.toLowerCase()) &&
    !selectedPositions.find(sp => sp.id === p.id)
  );

  const filteredSkills = availableSkills.filter(s =>
    s.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !selectedSkills.find(ss => ss.id === s.id)
  );

  return (
    <div className="min-h-screen w-full bg-[#050816] text-white flex justify-center px-6 py-16 relative overflow-hidden">

      {/* Glow background */}
      <div className="absolute w-[500px] h-[500px] bg-purple-600/20 blur-[140px] rounded-full top-[-120px] left-[-120px]" />
      <div className="absolute w-[400px] h-[400px] bg-indigo-500/20 blur-[140px] rounded-full bottom-[-120px] right-[-120px]" />

      <div className="w-full max-w-[900px] relative">

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-[36px] font-bold tracking-[-0.5px]">
            Đăng bài tuyển dụng mới
          </h1>

          <p className="text-[#A0A3BD] mt-3 text-[16px]">
            Đăng tin tuyển dụng mới và kết nối với các ứng viên tài năng.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#11142D] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.35)]">

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Job Title */}
            <div className="space-y-2">
              <label className="text-[#A0A3BD] text-sm">
                Tiêu đề công việc
              </label>

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Ví dụ: Nhà phát triển Backend cấp cao"
                className={`w-full h-[48px] px-4 rounded-[12px] bg-[#0F1333] border ${errors.title ? "border-red-500" : "border-[rgba(255,255,255,0.1)]"} focus:border-[#8B5CF6] outline-none placeholder-[#6B6F8E]`}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            {/* Job Position (Multi-select) */}
            <div className="space-y-2 relative">
              <label className="text-[#A0A3BD] text-sm">
                Vị trí công việc
              </label>

              <div
                className={`min-h-[48px] flex flex-wrap gap-2 p-2 rounded-[12px] bg-[#0F1333] border ${errors.positions ? "border-red-500" : "border-[rgba(255,255,255,0.1)]"} cursor-text`}
                onClick={() => setShowPositionDropdown(!showPositionDropdown)}
              >
                {selectedPositions.map((pos) => (
                  <Badge
                    key={pos.id}
                    variant="secondary"
                    className="flex items-center gap-1 bg-[#161A3F] text-[#A0A3BD] border-none px-3 py-1 rounded-full"
                  >
                    {pos.name}
                    <span
                      className="ml-1 p-0.5 rounded-full hover:bg-red-500/20 cursor-pointer transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePosition(pos);
                      }}
                    >
                      <X size={14} className="hover:text-red-400" />
                    </span>
                  </Badge>
                ))}
                <input
                  placeholder={selectedPositions.length === 0 ? "Chọn vị trí..." : ""}
                  className="flex-1 bg-transparent outline-none text-sm placeholder-[#6B6F8E] min-w-[120px]"
                  value={positionSearch}
                  onChange={(e) => {
                    setPositionSearch(e.target.value);
                    setShowPositionDropdown(true);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <ChevronsUpDown size={18} className="text-[#6B6F8E] self-center ml-auto" />
              </div>
              {errors.positions && <p className="text-red-500 text-xs mt-1">{errors.positions}</p>}

              {showPositionDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-[#11142D] border border-[rgba(255,255,255,0.1)] rounded-[12px] shadow-xl max-h-[200px] overflow-y-auto custom-scrollbar">
                  {loading ? (
                    <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-[#8B5CF6]" /></div>
                  ) : filteredPositions.length > 0 ? (
                    filteredPositions.map(pos => (
                      <div
                        key={pos.id}
                        className="px-4 py-2 hover:bg-[#161A3F] cursor-pointer transition text-sm flex items-center justify-between"
                        onClick={() => togglePosition(pos)}
                      >
                        {pos.name}
                        {selectedPositions.find(p => p.id === pos.id) && <Check size={14} className="text-[#8B5CF6]" />}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-[#6B6F8E]">Không tìm thấy vị trí nào</div>
                  )}
                </div>
              )}
            </div>

            {/* Employment + Location */}
            <div className="grid grid-cols-2 gap-6">

              <div className="space-y-2">
                <label className="text-[#A0A3BD] text-sm">
                  Hình thức làm việc
                </label>

                <select
                  name="employmentType"
                  value={form.employmentType}
                  onChange={handleChange}
                  className="w-full h-[48px] px-4 rounded-[12px] bg-[#0F1333] border border-[rgba(255,255,255,0.1)] focus:border-[#8B5CF6] outline-none"
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Internship</option>
                  <option>Contract</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[#A0A3BD] text-sm">
                  Địa điểm làm việc
                </label>

                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Từ xa / Thành phố Hồ Chí Minh"
                  className={`w-full h-[48px] px-4 rounded-[12px] bg-[#0F1333] border ${errors.location ? "border-red-500" : "border-[rgba(255,255,255,0.1)]"} focus:border-[#8B5CF6] outline-none placeholder-[#6B6F8E]`}
                />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
              </div>

            </div>

            {/* Job Skills (Multi-select) */}
            <div className="space-y-2 relative">
              <label className="text-[#A0A3BD] text-sm">
                Kỹ năng công việc
              </label>

              <div
                className={`min-h-[48px] flex flex-wrap gap-2 p-2 rounded-[12px] bg-[#0F1333] border ${errors.skills ? "border-red-500" : "border-[rgba(255,255,255,0.1)]"} cursor-text`}
                onClick={() => setShowSkillDropdown(!showSkillDropdown)}
              >
                {selectedSkills.map((skill) => (
                  <Badge
                    key={skill.id}
                    variant="secondary"
                    className="flex items-center gap-1 bg-[#161A3F] text-[#A0A3BD] border-none px-3 py-1 rounded-full"
                  >
                    {skill.name}
                    <span
                      className="ml-1 p-0.5 rounded-full hover:bg-red-500/20 cursor-pointer transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSkill(skill);
                      }}
                    >
                      <X size={14} className="hover:text-red-400" />
                    </span>
                  </Badge>
                ))}
                <input
                  placeholder={selectedSkills.length === 0 ? "Nhập kỹ năng..." : ""}
                  className="flex-1 bg-transparent outline-none text-sm placeholder-[#6B6F8E] min-w-[120px]"
                  value={skillSearch}
                  onChange={(e) => {
                    setSkillSearch(e.target.value);
                    setShowSkillDropdown(true);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <ChevronsUpDown size={18} className="text-[#6B6F8E] self-center ml-auto" />
              </div>
              {errors.skills && <p className="text-red-500 text-xs mt-1">{errors.skills}</p>}

              {showSkillDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-[#11142D] border border-[rgba(255,255,255,0.1)] rounded-[12px] shadow-xl max-h-[200px] overflow-y-auto custom-scrollbar">
                  {loading ? (
                    <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-[#8B5CF6]" /></div>
                  ) : filteredSkills.length > 0 ? (
                    filteredSkills.map(skill => (
                      <div
                        key={skill.id}
                        className="px-4 py-2 hover:bg-[#161A3F] cursor-pointer transition text-sm flex items-center justify-between"
                        onClick={() => toggleSkill(skill)}
                      >
                        {skill.name}
                        {selectedSkills.find(s => s.id === skill.id) && <Check size={14} className="text-[#8B5CF6]" />}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-[#6B6F8E]">Không tìm thấy kỹ năng nào</div>
                  )}
                </div>
              )}
            </div>

            {/* Salary */}
            <div className="grid grid-cols-2 gap-6">

              <div className="space-y-2">
                <label className="text-[#A0A3BD] text-sm">
                  Mức lương tối thiểu
                </label>

                <input
                  name="minSalary"
                  type="number"
                  value={form.minSalary}
                  onChange={handleChange}
                  placeholder="1000"
                  className={`w-full h-[48px] px-4 rounded-[12px] bg-[#0F1333] border ${errors.minSalary ? "border-red-500" : "border-[rgba(255,255,255,0.1)]"} focus:border-[#8B5CF6] outline-none placeholder-[#6B6F8E]`}
                />
                {errors.minSalary && <p className="text-red-500 text-xs mt-1">{errors.minSalary}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[#A0A3BD] text-sm">
                  Mức lương tối đa
                </label>

                <input
                  name="maxSalary"
                  type="number"
                  value={form.maxSalary}
                  onChange={handleChange}
                  placeholder="4000"
                  className={`w-full h-[48px] px-4 rounded-[12px] bg-[#0F1333] border ${errors.maxSalary ? "border-red-500" : "border-[rgba(255,255,255,0.1)]"} focus:border-[#8B5CF6] outline-none placeholder-[#6B6F8E]`}
                />
                {errors.maxSalary && <p className="text-red-500 text-xs mt-1">{errors.maxSalary}</p>}
              </div>

            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <label className="text-[#A0A3BD] text-sm">
                Hạn chót ứng tuyển
              </label>

              <input
                name="applicationDeadline"
                type="date"
                value={form.applicationDeadline}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className={`w-full h-[48px] px-4 rounded-[12px] bg-[#0F1333] border ${errors.applicationDeadline ? "border-red-500" : "border-[rgba(255,255,255,0.1)]"} focus:border-[#8B5CF6] outline-none`}
              />
              {errors.applicationDeadline && <p className="text-red-500 text-xs mt-1">{errors.applicationDeadline}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[#A0A3BD] text-sm">
                Mô tả công việc
              </label>

              <textarea
                name="description"
                rows={5}
                value={form.description}
                onChange={handleChange}
                placeholder="Mô tả trách nhiệm, yêu cầu và công nghệ..."
                className={`w-full p-4 rounded-[12px] bg-[#0F1333] border ${errors.description ? "border-red-500" : "border-[rgba(255,255,255,0.1)]"} focus:border-[#8B5CF6] outline-none placeholder-[#6B6F8E] resize-none`}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              <div className="mt-2 p-4 rounded-[12px] bg-[#0F1333]/40 border border-[rgba(255,255,255,0.06)] backdrop-blur-sm transition-all hover:bg-[#0F1333]/60">
                <p className="font-semibold text-[#A0A3BD] mb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <Info size={14} className="text-[#8B5CF6]" /> Hướng dẫn định dạng:
                </p>
                <ul className="space-y-2 text-xs text-[#71717A]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#8B5CF6]/60 mt-0.5">•</span>
                    <span>Dùng <code className="bg-white/5 px-1.5 py-0.5 rounded text-[#8B5CF6] border border-white/5">### Tiêu đề</code> để tạo tiêu đề các mục (VD: ### Quyền lợi)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#8B5CF6]/60 mt-0.5">•</span>
                    <span>Dùng <code className="bg-white/5 px-1.5 py-0.5 rounded text-[#8B5CF6] border border-white/5">- Nội dung</code> để tạo dòng có dấu tích xanh (VD: - Chế độ bảo hiểm)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#8B5CF6]/60 mt-0.5">•</span>
                    <span>Nhấn <span className="text-slate-400 font-medium italic">Enter</span> để xuống dòng bình thường.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-[rgba(255,255,255,0.06)] pt-6 flex justify-end gap-4">

              <button
                type="button"
                className="h-[48px] px-6 rounded-[12px] text-[#A0A3BD] hover:text-white transition"
              >
                Hủy
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-[48px] px-8 rounded-[12px] font-semibold bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6]"
              >
                {isSubmitting ? "Đang tạo..." : "Tạo tin tuyển dụng"}
              </button>

            </div>

          </form>
        </div>

      </div>
      {/* Click outside to close dropdowns */}
      {(showPositionDropdown || showSkillDropdown) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowPositionDropdown(false);
            setShowSkillDropdown(false);
          }}
        />
      )}
    </div>
  );
};

export default CreateJobApplication;
