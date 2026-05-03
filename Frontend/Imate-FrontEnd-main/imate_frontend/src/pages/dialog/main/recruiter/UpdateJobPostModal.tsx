import React, { useState, useEffect } from "react";
import { X, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { getAllPositions, getAllSkills } from "@/services/commonService";
import type { PositionItem, SkillItem } from "@/types/common/question";
import { Badge } from "@/components/ui/badge";
import { UpdateJob } from "@/services/recruiterService";
import { toast } from "react-toastify";
import type { JobItem } from "@/types/common/recruiter";
import { MSG54, MSG55 } from "@/constants/messages";

interface UpdateJobPostModalProps {
  open: boolean;
  onClose: () => void;
  job: JobItem | null;
  onSuccess: () => void;
}

const UpdateJobPostModal: React.FC<UpdateJobPostModalProps> = ({ open, onClose, job, onSuccess }) => {
  const [form, setForm] = useState({
    title: "",
    employmentType: "Full-time",
    location: "",
    minSalary: "",
    maxSalary: "",
    description: "",
    applicationDeadline: "",
    status: "Open",
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
      } catch (error) {
        console.error("Failed to fetch skills/positions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
  }, [availablePositions, availableSkills]);

  useEffect(() => {
    if (job) {
      setForm({
        title: job.title || "",
        employmentType: job.employmentType || "Full-time",
        location: job.location || "",
        minSalary: job.minSalary?.toString() || "",
        maxSalary: job.maxSalary?.toString() || "",
        description: job.jobDescription || "",
        applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : "",
        status: job.status || "Open",
      });

      // Map API names (skillName/positionName) to the internal 'name' property used by the component
      if (job.jobPositions) {
        const mappedPositions = job.jobPositions.map(p => ({
          id: p.id,
          name: p.positionName
        }));
        setSelectedPositions(mappedPositions);
      }

      if (job.jobSkills) {
        const mappedSkills = job.jobSkills.map(s => ({
          id: s.id,
          name: s.skillName
        }));
        setSelectedSkills(mappedSkills);
      }
    }
  }, [job]);

  useEffect(() => {
  }, [selectedPositions]);

  useEffect(() => {
  }, [selectedSkills]);

  if (!open) return null;

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
    if (!job) return;

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin nhập liệu");
      return;
    }

    try {
      const payload = {
        id: job.id,
        ...form,
        minSalary: Number(form.minSalary),
        maxSalary: Number(form.maxSalary),
        JobPositions: selectedPositions.map(p => p.id),
        JobSkills: selectedSkills.map(s => s.id),
      };
      setIsSubmitting(true);

      await UpdateJob(payload);
      setIsSubmitting(false);

      toast.success(MSG54);
      onSuccess();
      onClose();

    } catch (error) {
      console.error(error);
      toast.error(MSG55);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#020617]/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[850px] bg-[#11142D] border border-[rgba(255,255,255,0.08)] rounded-[20px] shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Chỉnh sửa bài đăng tuyển dụng
            </h2>
            <p className="text-slate-400 text-sm">
              Cập nhật thông tin chi tiết về vị trí công việc của bạn.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Job Title */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                  Tiêu đề công việc
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="VD: Senior Backend Developer"
                  className={`w-full h-12 px-4 rounded-xl bg-[#0F1333] border ${errors.title ? "border-red-500" : "border-white/10"} focus:border-indigo-500 outline-none text-white transition-all placeholder:text-slate-600`}
                />
                {errors.title && <p className="text-red-500 text-[10px] mt-1 italic font-medium">{errors.title}</p>}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                  Trạng thái
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-xl bg-[#0F1333] border border-white/10 focus:border-indigo-500 outline-none text-white"
                >
                  <option value="Open">Đang mở (Open)</option>
                  <option value="Closed">Đã đóng (Closed)</option>
                </select>
              </div>

              {/* Employment Type */}
              <div className="space-y-2">
                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                  Hình thức làm việc
                </label>
                <select
                  name="employmentType"
                  value={form.employmentType}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-xl bg-[#0F1333] border border-white/10 focus:border-indigo-500 outline-none text-white"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                  Địa điểm
                </label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="VD: Remote / TP. Hồ Chí Minh"
                  className={`w-full h-12 px-4 rounded-xl bg-[#0F1333] border ${errors.location ? "border-red-500" : "border-white/10"} focus:border-indigo-500 outline-none text-white transition-all placeholder:text-slate-600`}
                />
                {errors.location && <p className="text-red-500 text-[10px] mt-1 italic font-medium">{errors.location}</p>}
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                  Hạn chót ứng tuyển
                </label>
                <input
                  name="applicationDeadline"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={form.applicationDeadline}
                  onChange={handleChange}
                  className={`w-full h-12 px-4 rounded-xl bg-[#0F1333] border ${errors.applicationDeadline ? "border-red-500" : "border-white/10"} focus:border-indigo-500 outline-none text-white`}
                />
                {errors.applicationDeadline && <p className="text-red-500 text-[10px] mt-1 italic font-medium">{errors.applicationDeadline}</p>}
              </div>

              {/* Salary Min */}
              <div className="space-y-2">
                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                  Lương tối thiểu ($)
                </label>
                <input
                  name="minSalary"
                  type="number"
                  value={form.minSalary}
                  onChange={handleChange}
                  placeholder="1000"
                  className={`w-full h-12 px-4 rounded-xl bg-[#0F1333] border ${errors.minSalary ? "border-red-500" : "border-white/10"} focus:border-indigo-500 outline-none text-white transition-all placeholder:text-slate-600`}
                />
                {errors.minSalary && <p className="text-red-500 text-[10px] mt-1 italic font-medium">{errors.minSalary}</p>}
              </div>

              {/* Salary Max */}
              <div className="space-y-2">
                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                  Lương tối đa ($)
                </label>
                <input
                  name="maxSalary"
                  type="number"
                  value={form.maxSalary}
                  onChange={handleChange}
                  placeholder="4000"
                  className={`w-full h-12 px-4 rounded-xl bg-[#0F1333] border ${errors.maxSalary ? "border-red-500" : "border-white/10"} focus:border-indigo-500 outline-none text-white transition-all placeholder:text-slate-600`}
                />
                {errors.maxSalary && <p className="text-red-500 text-[10px] mt-1 italic font-medium">{errors.maxSalary}</p>}
              </div>
            </div>

            {/* Positions - simplified for edit if details not available */}
            <div className="space-y-2 relative">
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                Vị trí tuyển dụng
              </label>
              <div
                className={`min-h-[48px] flex flex-wrap gap-2 p-2 rounded-xl bg-[#0F1333] border ${errors.positions ? "border-red-500" : "border-white/10"} cursor-text`}
                onClick={() => setShowPositionDropdown(!showPositionDropdown)}
              >
                {selectedPositions.map((pos) => (
                  <Badge
                    key={pos.id}
                    variant="secondary"
                    className="flex items-center gap-1 bg-indigo-500/20 text-indigo-300 border-none px-3 py-1 rounded-full"
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
                  className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-slate-600 min-w-[120px]"
                  value={positionSearch}
                  onChange={(e) => {
                    setPositionSearch(e.target.value);
                    setShowPositionDropdown(true);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <ChevronsUpDown size={18} className="text-slate-500 self-center ml-auto" />
              </div>
              {errors.positions && <p className="text-red-500 text-[10px] mt-1 italic font-medium">{errors.positions}</p>}
              {showPositionDropdown && (
                <div className="absolute z-50 w-full mt-2 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl max-h-[200px] overflow-y-auto custom-scrollbar">
                  {loading ? (
                    <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>
                  ) : filteredPositions.length > 0 ? (
                    filteredPositions.map(pos => (
                      <div
                        key={pos.id}
                        className="px-4 py-2 hover:bg-white/5 cursor-pointer transition text-sm text-slate-300 flex items-center justify-between"
                        onClick={() => togglePosition(pos)}
                      >
                        {pos.name}
                        {selectedPositions.find(p => p.id === pos.id) && <Check size={14} className="text-indigo-500" />}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-slate-500">Không tìm thấy vị trí</div>
                  )}
                </div>
              )}
            </div>

            {/* Skills - simplified for edit if details not available */}
            <div className="space-y-2 relative">
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                Yêu cầu kỹ năng
              </label>
              <div
                className={`min-h-[48px] flex flex-wrap gap-2 p-2 rounded-xl bg-[#0F1333] border ${errors.skills ? "border-red-500" : "border-white/10"} cursor-text`}
                onClick={() => setShowSkillDropdown(!showSkillDropdown)}
              >
                {selectedSkills.map((skill) => (
                  <Badge
                    key={skill.id}
                    variant="secondary"
                    className="flex items-center gap-1 bg-purple-500/20 text-purple-300 border-none px-3 py-1 rounded-full"
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
                  placeholder={selectedSkills.length === 0 ? "Tìm kiếm kỹ năng..." : ""}
                  className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-slate-600 min-w-[120px]"
                  value={skillSearch}
                  onChange={(e) => {
                    setSkillSearch(e.target.value);
                    setShowSkillDropdown(true);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <ChevronsUpDown size={18} className="text-slate-500 self-center ml-auto" />
              </div>
              {errors.skills && <p className="text-red-500 text-[10px] mt-1 italic font-medium">{errors.skills}</p>}
              {showSkillDropdown && (
                <div className="absolute z-50 w-full mt-2 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl max-h-[200px] overflow-y-auto custom-scrollbar">
                  {loading ? (
                    <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-purple-500" /></div>
                  ) : filteredSkills.length > 0 ? (
                    filteredSkills.map(skill => (
                      <div
                        key={skill.id}
                        className="px-4 py-2 hover:bg-white/5 cursor-pointer transition text-sm text-slate-300 flex items-center justify-between"
                        onClick={() => toggleSkill(skill)}
                      >
                        {skill.name}
                        {selectedSkills.find(s => s.id === skill.id) && <Check size={14} className="text-purple-500" />}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-slate-500">Không tìm thấy kỹ năng</div>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                Mô tả công việc
              </label>
              <textarea
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Mô tả trách nhiệm, quyền lợi, yêu cầu..."
                className={`w-full p-4 rounded-xl bg-[#0F1333] border ${errors.description ? "border-red-500" : "border-white/10"} focus:border-indigo-500 outline-none text-white transition-all placeholder:text-slate-600 resize-none`}
              />
              {errors.description && <p className="text-red-500 text-[10px] mt-1 italic font-medium">{errors.description}</p>}
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isSubmitting ? "Đang cập nhật..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Dropdown Click Outside Layer */}
      {(showPositionDropdown || showSkillDropdown) && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => {
            setShowPositionDropdown(false);
            setShowSkillDropdown(false);
          }}
        />
      )}
    </div>
  );
};

export default UpdateJobPostModal;
