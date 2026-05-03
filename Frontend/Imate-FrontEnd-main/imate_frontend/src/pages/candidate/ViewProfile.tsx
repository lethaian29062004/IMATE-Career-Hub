import type React from "react";
import { Globe, Users, MapPin } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Star, ArrowUpCircle, Briefcase, Code2, Award, Phone, Mail, FileText, BookA, Building, CreditCard, CircleUser, Landmark, Edit } from "lucide-react";
import SettingTab from "@/components/custom/ViewProfileTabs/SettingTab";
import { updateMyProfile } from "@/services/accountService";
import { toast } from "react-toastify";
import { calculateAge, formatPrice, getAvatarColor, getInitials } from "@/helpers/common";
import { getBankDetail } from "@/services/mentorService";
import UpdateMentorDialog from "../dialog/UpdateMentorDialog";
import usePriceUpdateControl from "@/helpers/usePriceUpdateControl";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import UpdateRecruiterDialog from "../dialog/UpdateRecruiterDialog";
import "@/constants/messages";
import { MSG09, MSG10 } from "@/constants/messages";

const nameSchema = z.object({
  fullName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
});

const ViewProfile = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Thêm state loading
  const [bank, setBank] = useState<any>({});
  const navigate = useNavigate();
  const { user, refetchUser, isLoading } = useAuth(); // Lấy cả isLoading để điều khiển render
  const { canUpdate, remainingTimeDisplay, recordUpdate } = usePriceUpdateControl();
  const [loaded, setLoaded] = useState(false);

  // --- Lấy bank detail ---
  useEffect(() => {
    if (!user?.bankCode) return;

    getBankDetail(user?.bankCode || "")
      .then((bank) => setBank(bank))
      .catch((err) => console.log(err));
  }, [user?.bankCode]);

  // --- State mới để quản lý file và ảnh preview ---
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // Lưu File object để upload
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatar || undefined); // Lưu URL để hiển thị
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof nameSchema>>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      fullName: user?.fullName,
    },
  });

  useEffect(() => {
    if (!isEditMode) {
      setAvatarPreview(user?.avatar || undefined);
    }
  }, [user, isEditMode]);

  useEffect(() => {
    form.reset({ fullName: user?.fullName });
  }, [user, form]);

  useEffect(() => {
    if (!avatarPreview) {
      setLoaded(false);
      return;
    }
    const img = new Image();
    img.src = avatarPreview;

    img.onload = () => setLoaded(true);
    img.onerror = () => setLoaded(false);
  }, [avatarPreview]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Thêm type
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setAvatarFile(null);
    setAvatarPreview(user?.avatar || undefined);
    form.reset({ fullName: user?.fullName });
  };

  const handleSaveProfile = async (values: z.infer<typeof nameSchema>) => {
    setIsSubmitting(true);
    try {
      await updateMyProfile({
        fullName: values.fullName,
        avatarFile: avatarFile,
      });
      await refetchUser();
      setIsEditMode(false);
      setAvatarFile(null);
      toast.success(MSG09);
    } catch (error) {
      toast.error(MSG10);
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const didRefetch = useRef(false);
  useEffect(() => {
    if (!didRefetch.current && !user) {
      didRefetch.current = true;
      refetchUser();
    }
  }, [user, refetchUser]);

  const currentPlan = user?.subscription || "Gói Thường";
  const isRecruiter = user?.role === "Recruiter";
  const isMentor = user?.role === "Mentor";
  const isAdmin = user?.role === "Admin";
  const isStaff = user?.role === "Staff";
  // Guard render: đang tải
  if (isLoading) {
    return (
      <div className="mx-auto mt-5 max-w-7xl px-4 pb-12 md:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <p className="text-sm text-gray-500">Đang tải thông tin người dùng...</p>
          </div>
        </div>
      </div>
    );
  }
  // Sau khi tải xong nhưng không có user
  if (!user) {
    return (
      <div className="mx-auto mt-5 max-w-7xl px-4 pb-12 md:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <p className="text-sm text-gray-500">Không tìm thấy thông tin người dùng.</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className=" bg-[#050816] text-white">

      <div className="container mx-auto px-4 pb-16 pt-6 md:px-10 max-w-[1200px]">
        {/* === 1. PROFILE HEADER === */}
        <div className="mx-auto">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

          <div className="flex flex-col items-center justify-between gap-6 rounded-[16px] border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm p-6 shadow-[0_20px_40px_rgba(0,0,0,0.35)] md:flex-row">
            <div className="flex flex-col items-center gap-6 md:flex-row">
              {/* Avatar */}
              <div className="relative h-24 w-24 md:h-32 md:w-32">
                <div
                  className={cn(
                    "relative flex h-full w-full items-center justify-center overflow-hidden rounded-full ring-2 ring-[#8B5CF6]/40 font-semibold transition-all",
                    getAvatarColor(user?.fullName || "User"),
                    isEditMode && "cursor-pointer hover:brightness-90 active:scale-95"
                  )}
                  onClick={isEditMode ? handleCameraClick : undefined}
                >
                  {loaded ? <img src={avatarPreview} className="h-full w-full object-cover" /> : <span className="font-semibold text-white">{getInitials(user?.fullName || "User")}</span>}
                  {isEditMode && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
                      <Camera className="h-8 w-8 text-white/70" />
                    </div>
                  )}
                </div>
                {isEditMode && (
                  <Button className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white shadow-lg transition hover:brightness-110" onClick={handleCameraClick}>
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Edit Form hoặc Display Info */}
              {isEditMode ? (
                <Form {...form}>
                  <form id="updateProfileForm" onSubmit={form.handleSubmit(handleSaveProfile)} className="flex w-full flex-col gap-4 md:w-auto md:flex-row md:items-end">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Họ và tên</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập họ và tên" {...field} className="min-w-[250px]" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              ) : (
                <div className="flex flex-col items-center gap-1 md:items-start">
                  <h3 className="text-[28px] font-semibold text-white tracking-[-0.3px]">{user?.fullName}</h3>
                  <p className="text-[#A0A3BD] text-sm">{user?.email}</p>
                  {isMentor && (
                    <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#8B5CF6]/15 px-3 py-1 text-sm font-medium text-[#A78BFA] dark:bg-indigo-900/30 dark:text-indigo-300">
                      <Briefcase size={14} />
                      Mentor
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Nút Chỉnh sửa / Lưu */}
            {!isEditMode ? (
              <Button className="w-full cursor-pointer bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-sm hover:brightness-110 md:w-auto md:text-base gap-2" onClick={() => setIsEditMode(true)}>
                <Edit className="h-4 w-4" />
                Chỉnh sửa hồ sơ
              </Button>
            ) : (
              <div className="flex w-full flex-col gap-2 md:w-auto md:items-end">
                <Button type="submit" form="updateProfileForm" disabled={isSubmitting} className="w-full cursor-pointer bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-sm hover:brightness-110 md:w-auto md:text-base">
                  {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
                <Button variant="outline" className="w-full cursor-pointer bg-transparent md:w-auto" onClick={handleCancelEdit} disabled={isSubmitting}>
                  Hủy
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* === 2. MENTOR DETAILS SECTION === */}
        {isMentor && (
          <div className="mx-auto mt-10 space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Card className="rounded-[16px] border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm shadow-[0_10px_25px_rgba(0,0,0,0.35)]">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[#8B5CF6] dark:text-blue-400">{user?.yoe || 0}</div>
                  <p className="text-md text-gray-600 dark:text-gray-400">Năm kinh nghiệm</p>
                </CardContent>
              </Card>
              <Card className="rounded-[16px] border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm shadow-[0_10px_25px_rgba(0,0,0,0.35)]">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{user?.totalRatingCount || 0}</div>
                  <p className="text-md text-gray-600 dark:text-gray-400">Đánh giá</p>
                </CardContent>
              </Card>
              <Card className="rounded-[16px] border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm shadow-[0_10px_25px_rgba(0,0,0,0.35)]">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star size={18} className="fill-yellow-500 text-yellow-500" />
                    <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{user?.avgRatings?.toFixed(1) || 0}</span>
                  </div>
                  <p className="text-md text-gray-600 dark:text-gray-400">Đánh giá trung bình</p>
                </CardContent>
              </Card>
              <Card className="relative rounded-[16px] border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm shadow-[0_10px_25px_rgba(0,0,0,0.35)]">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatPrice(user?.pricePerSession || 0)}</div>
                  <p className="text-md text-gray-600 dark:text-gray-400">Giá/phiên</p>
                  <div className="absolute top-1 right-1">
                    {canUpdate ? (
                      <UpdateMentorDialog
                        data={user}
                        type="price"
                        onSubmit={() => {
                          recordUpdate();
                          refetchUser();
                        }}
                      />
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild className="cursor-pointer">
                          <span className="inline-flex">
                            <Button className="h-7 w-7 p-0 cursor-pointer bg-green-500 hover:bg-green-500/50 flex items-center justify-center" disabled>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>{remainingTimeDisplay}</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <Card className="rounded-[16px] border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-[18px] font-semibold text-white">Thông tin liên hệ</CardTitle>
                <UpdateMentorDialog data={user} type="personal" onSubmit={() => refetchUser()} />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-[#A0A3BD]">{user?.email}</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-[#A0A3BD]">{user.phone}</span>
                  </div>
                )}
                {user?.birthDate && (
                  <div className="flex items-center gap-3">
                    <BookA size={18} className="text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-[#A0A3BD]">
                      {calculateAge(user.birthDate)} tuổi • Sinh ngày {new Date(user.birthDate).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bank Information */}
            {(user?.bankAccountHolderName || user?.bankAccountNumber || user?.bankCode) && (
              <Card className="rounded-[16px] border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">Thông tin ngân hàng</CardTitle>
                  <UpdateMentorDialog data={user} type="bank" onSubmit={() => refetchUser()} />
                </CardHeader>
                <CardContent className="space-y-6">
                  {user?.bankAccountHolderName && (
                    <div className="flex items-center gap-3">
                      <CircleUser size={18} className="text-gray-500 dark:text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 md:text-[14px] dark:text-gray-400">Chủ tài khoản</p>
                        <p className="text-sm font-semibold text-[#A0A3BD]">{user.bankAccountHolderName}</p>
                      </div>
                    </div>
                  )}
                  {user?.bankAccountNumber && (
                    <div className="flex items-center gap-3">
                      <CreditCard size={18} className="text-gray-500 dark:text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 md:text-[14px] dark:text-gray-400">Số tài khoản</p>
                        <p className="text-sm font-semibold text-[#A0A3BD]">{user.bankAccountNumber}</p>
                      </div>
                    </div>
                  )}
                  {user?.bankCode && (
                    <div className="flex items-center gap-3">
                      <Landmark size={18} className="rounded-md text-gray-500" />

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-500 sm:text-sm">Ngân hàng</p>

                        <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-[#0F1333] p-2">
                          <img
                            src={bank.logo}
                            alt={bank.name}
                            className="h-10 w-10 flex-shrink-0 rounded-md border border-white/10 bg-white object-contain md:h-12 md:w-12"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-white">
                              {bank.name}
                            </p>

                            <p className="truncate text-xs text-[#A0A3BD]">
                              {bank.code}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Bio */}
            {user?.bio && (
              <Card className="rounded-[16px] border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="text-[18px] font-semibold text-white">Giới thiệu</CardTitle>
                  <UpdateMentorDialog data={user} type="bio" onSubmit={() => refetchUser()} />
                </CardHeader>
                <CardContent>
                  <p className="text-sm break-words whitespace-pre-wrap text-[#A0A3BD]">{user.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Positions */}
            <div className="grid gap-4 md:grid-cols-2">
              {user?.companies && user.companies.length > 0 && (
                <Card className="rounded-[16px] border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Building size={18} className="text-indigo-600 dark:text-indigo-400" />
                      Công ty
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {user.companies.map((company, index) => (
                        <span key={index} className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                          {company}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {user?.positions && user.positions.length > 0 && (
                <Card className="rounded-[16px] border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Briefcase size={18} className="text-indigo-600 dark:text-indigo-400" />
                      Vị trí
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {user.positions.map((position, index) => (
                        <span key={index} className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                          {position}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Skills */}
            {user?.skills && user.skills.length > 0 && (
              <Card className="rounded-[16px] border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code2 size={20} className="text-indigo-600 dark:text-indigo-400" />
                    Kỹ năng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, index) => (
                      <span key={index} className="inline-flex items-center rounded-full bg-[#8B5CF6]/15 px-3 py-1 text-sm font-medium text-[#A78BFA] dark:bg-indigo-900/30 dark:text-indigo-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            {(user?.cvUrl || user?.certificateUrl) && (
              <Card className="rounded-[16px] border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
                    Hồ sơ cá nhân
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {user?.cvUrl && (
                    <a href={user.cvUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg bg-indigo-50 p-3 text-sm font-medium text-indigo-600 hover:bg-[#8B5CF6]/15 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30">
                      <FileText size={16} />
                      Tải CV
                    </a>
                  )}
                  {user?.certificateUrl && (
                    <a href={user.certificateUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30">
                      <Award size={16} />
                      Xem chứng chỉ
                    </a>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* === RECRUITER DETAILS SECTION === */}
        {isRecruiter && (
          <div className="mx-auto mt-10 space-y-8">

            {/* Company Info */}
            <Card className="rounded-[16px] border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Building size={18} />
                  Thông tin công ty
                </CardTitle>

                <UpdateRecruiterDialog
                  data={user}
                  onSubmit={() => refetchUser()}
                />
              </CardHeader>

              <CardContent className="space-y-5">

                {/* Company Logo + Name */}
                {(user.companyLogo || user.companyName) && (
                  <div className="flex items-center gap-4">
                    {user.companyLogo && (
                      <img
                        src={user.companyLogo}
                        className="h-16 w-16 rounded-lg object-contain bg-white p-2"
                      />
                    )}

                    <div>
                      <p className="text-sm text-gray-400">Tên công ty</p>
                      <p className="text-white font-semibold">
                        {user.companyName || "Chưa cập nhật"}
                      </p>
                    </div>
                  </div>
                )}
                {/* RecruiterPhone */}
                {user.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Số điện thoại</p>
                      <p className="text-sm text-[#A0A3BD]">{user.phone}</p>
                    </div>
                  </div>
                )}

                {/* Website */}
                {user.website && (
                  <div className="flex items-center gap-3">
                    <Globe size={18} className="text-gray-400" />
                    <a
                      href={user.website}
                      target="_blank"
                      className="text-[#A78BFA] text-sm hover:underline"
                    >
                      {user.website}
                    </a>
                  </div>
                )}

                {/* Industry */}
                {user.industry && (
                  <div className="flex items-center gap-3">
                    <Briefcase size={18} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Lĩnh vực</p>
                      <p className="text-sm text-[#A0A3BD]">{user.industry}</p>
                    </div>
                  </div>
                )}

                {/* Company Size */}
                {user.companySize && (
                  <div className="flex items-center gap-3">
                    <Users size={18} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Quy mô công ty</p>
                      <p className="text-sm text-[#A0A3BD]">{user.companySize}</p>
                    </div>
                  </div>
                )}

                {/* Address */}
                {user.address && (
                  <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Địa chỉ</p>
                      <p className="text-sm text-[#A0A3BD]">{user.address}</p>
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>

          </div>
        )}

        {/* === 3. CONTENT AREA (Settings Tab) === */}
        <div className={`mx-auto grid grid-cols-1 gap-8 ${!(isMentor || isAdmin || isStaff || isRecruiter) ? "mt-10 lg:grid-cols-3" : "mt-8 lg:grid-cols-1"}`}>
          <div className="flex flex-col gap-8 lg:col-span-2">
            <SettingTab />
          </div>

          {!(isMentor || isAdmin || isStaff || isRecruiter) && (
            <div className="lg:col-span-1">
              <Card className="sticky top-24 rounded-[16px] border border-white/5 bg-[#1e293b]/40 backdrop-blur-sm shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#A78BFA] dark:text-indigo-300">
                    <Star size={20} />
                    Gói cước của bạn
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4 text-center">
                  <h3 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{currentPlan}</h3>
                  <p className="text-muted-foreground text-sm">Nâng cấp để mở khóa tất cả các tính năng nâng cao.</p>
                  <Button className="w-full cursor-pointer bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white hover:brightness-110" onClick={() => navigate("/view-subscription")}>
                    <ArrowUpCircle size={18} className="mr-2" />
                    Nâng cấp ngay
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
