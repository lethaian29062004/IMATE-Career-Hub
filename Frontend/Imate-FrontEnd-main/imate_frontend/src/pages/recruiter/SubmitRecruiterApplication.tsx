import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "@/store/AuthContext";
import { submitRecruiterProfile, uploadCompanyLogo } from "@/services/recruiterService";
import { getListCompany } from "@/services/companyService";
import type { SubmitRecruiterProfileRequest } from "@/types/request/recruiter.request";
import type { CompanyItem } from "@/types/response/company.response";
import { Briefcase, Camera, Upload, Check, ChevronsUpDown, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export default function SubmitRecruiterApplication() {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading, refetchUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SubmitRecruiterProfileRequest>({
    companyName: "",
    companyAddress: "",
    companyWebsite: "",
    phone: "",
  });

  // Company selection states
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [isFetchingCompanies, setIsFetchingCompanies] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target;

    // Enforce digits only for phone
    if (name === "phone") {
      value = value.replace(/\D/g, "");
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File quá lớn. Vui lòng chọn file dưới 2MB.");
      return;
    }

    setIsLoading(true);
    try {
      const url = await uploadCompanyLogo(file);
      setFormData((prev) => ({ ...prev, companyLogo: url }));
      toast.success("Tải logo lên thành công.");
    } catch (err: any) {
      const msg = err.message || "Không thể tải logo lên. Vui lòng thử lại.";
      toast.error(msg);
      console.error("Logo upload error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName?.trim() || !formData.companyAddress?.trim() || !formData.phone?.trim()) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const payload: SubmitRecruiterProfileRequest = {
        companyName: formData.companyName.trim(),
        companyAddress: formData.companyAddress.trim(),
        phone: formData.phone.trim(),
      };
      if (formData.companyWebsite?.trim()) payload.companyWebsite = formData.companyWebsite.trim();
      if (formData.companyLogo) payload.companyLogo = formData.companyLogo;

      await submitRecruiterProfile(payload);
      await refetchUser();
      toast.success("Nộp hồ sơ Nhà Tuyển Dụng thành công. Vui lòng chờ hệ thống duyệt.");
      navigate("/recruiter-pending-application", { replace: true });
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err && err.response && typeof (err.response as { data?: { message?: string; Message?: string } }).data === "object"
        ? ((err.response as { data: { message?: string; Message?: string } }).data?.Message ?? (err.response as { data: { message?: string } }).data?.message)
        : "Có lỗi xảy ra, vui lòng thử lại.";
      setError(msg ?? "Có lỗi xảy ra, vui lòng thử lại.");
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "Recruiter") {
      setFormData((prev) => ({
        ...prev,
        companyName: user.companyName || prev.companyName,
        companyAddress: user.address || prev.companyAddress,
        companyWebsite: user.website || prev.companyWebsite,
        phone: user.phone || prev.phone,
        companyLogo: user.companyLogo || prev.companyLogo,
      }));
    }
  }, [user]);

  // Fetch companies for selection
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsFetchingCompanies(true);
      try {
        const response = await getListCompany(1, 100, searchValue, true);
        if (response?.items) {
          setCompanies(response.items);
        }
      } catch (err) {
        console.error("Error fetching companies:", err);
      } finally {
        setIsFetchingCompanies(false);
      }
    };

    const timer = setTimeout(() => {
      fetchCompanies();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleSelectCompany = (company: CompanyItem) => {
    setFormData((prev) => ({
      ...prev,
      companyName: company.name,
      companyLogo: company.imageUrl || prev.companyLogo,
    }));
    setOpen(false);
  };

  const handleManualCompanyName = (name: string) => {
    setFormData((prev) => ({ ...prev, companyName: name }));
    setOpen(false);
  };

  // Dùng useEffect để redirect, tránh navigate() during render
  useEffect(() => {
    if (isAuthLoading) return;

    if (!user || user.role !== "Recruiter") {
      navigate("/", { replace: true });
    } else if (user.accountStatus === "Active") {
      navigate("/management/recruiter-dashboard/job-applications", { replace: true });
    } else if (user.accountStatus === "PendingVerification" && user.verificationStatus !== "Rejected" && user.companyName) {
      navigate("/recruiter-pending-application", { replace: true });
    }
  }, [user, isAuthLoading, navigate]);

  // Hiển thị loading trong khi đang redirect hoặc check quyền
  if (isAuthLoading || !user || user.role !== "Recruiter" || user.accountStatus === "Active") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-[#020617]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-500"></div>
      </div>
    );
  }


  const inputClass = "w-full bg-slate-900/50 border border-white/10 rounded-xl h-12 px-4 text-sm focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-slate-500";
  const labelClass = "text-sm text-slate-300 font-medium mb-1 block";

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-[#020617]">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-indigo-500/20">
            <Briefcase className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Nộp hồ sơ Nhà Tuyển Dụng</h1>
            <p className="text-sm text-slate-400">Điền thông tin để hoàn tất đăng ký Recruiter</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden transition group-hover:border-indigo-500/50">
                {formData.companyLogo ? (
                  <img src={formData.companyLogo} alt="Company Logo" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="h-8 w-8 text-slate-500 group-hover:text-indigo-400 transition" />
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 rounded-lg cursor-pointer hover:bg-indigo-500 transition shadow-lg">
                <Camera className="h-4 w-4 text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            </div>
            <p className="text-xs text-slate-500 mt-3">Logo công ty (Khuyên dùng 512x512, &lt; 2MB)</p>
          </div>

          <div>
            <label className={labelClass}>Tên công ty *</label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(inputClass, "flex items-center justify-between font-normal text-left h-12")}
                >
                  {formData.companyName || "Chọn hoặc nhập tên công ty..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-slate-900 border-white/10" align="start">
                <Command className="bg-slate-900 text-white" shouldFilter={false}>
                  <CommandInput
                    placeholder="Tìm kiếm công ty..."
                    value={searchValue}
                    onValueChange={setSearchValue}
                    className="text-white"
                  />
                  <CommandList className="max-h-64 overflow-y-auto custom-scrollbar">
                    {isFetchingCompanies ? (
                      <div className="py-6 text-center text-sm text-slate-400">Đang tìm kiếm...</div>
                    ) : (
                      <>
                        <CommandEmpty className="flex flex-col items-center gap-2 py-6">
                          <p className="text-sm text-slate-400">Không tìm thấy công ty thành viên nào.</p>
                          {searchValue.trim() && (
                            <button
                              type="button"
                              onClick={() => handleManualCompanyName(searchValue.trim())}
                              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                            >
                              Sử dụng "{searchValue.trim()}" làm tên công ty của bạn
                            </button>
                          )}
                        </CommandEmpty>
                        <CommandGroup heading="Danh sách công ty hệ thống">
                          {companies.map((company) => (
                            <CommandItem
                              key={company.id}
                              value={company.name}
                              onSelect={() => handleSelectCompany(company)}
                              className="flex items-center gap-2 py-3 px-4 hover:bg-white/5 cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.companyName === company.name ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {company.imageUrl && (
                                <img src={company.imageUrl} alt={company.name} className="h-6 w-6 rounded object-contain bg-white/10" />
                              )}
                              <span>{company.name}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        {searchValue.trim() && !companies.some(c => c.name.toLowerCase() === searchValue.trim().toLowerCase()) && (
                          <>
                            <div className="h-px bg-white/5 mx-1 my-1" />
                            <CommandGroup heading="Tùy chọn khác">
                              <CommandItem
                                value={searchValue}
                                onSelect={() => handleManualCompanyName(searchValue.trim())}
                                className="py-3 px-4 hover:bg-white/5 cursor-pointer text-indigo-400"
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Thêm mới: "{searchValue.trim()}"
                              </CommandItem>
                            </CommandGroup>
                          </>
                        )}
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className={labelClass}>Địa chỉ công ty *</label>
            <textarea
              name="companyAddress"
              value={formData.companyAddress}
              onChange={handleChange}
              placeholder="Nhập địa chỉ chi tiết công ty..."
              rows={2}
              className={`${inputClass} h-auto py-3 resize-none`}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Số điện thoại liên hệ *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="VD: 0987 654 321"
              className={inputClass}
              required
            />
          </div>



          <div>
            <label className={labelClass}>Website công ty (tùy chọn)</label>
            <input
              type="url"
              name="companyWebsite"
              value={formData.companyWebsite ?? ""}
              onChange={handleChange}
              placeholder="https://vidu.com"
              className={inputClass}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white transition disabled:opacity-50"
          >
            {isLoading ? "Đang gửi..." : "Nộp hồ sơ"}
          </button>
        </form>
      </div>
    </div>
  );
}
