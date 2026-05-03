import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/store/AuthContext";
import { z } from "zod";
import { toast } from "react-toastify";
import { Globe, Users, MapPin, Building, Phone, Briefcase, Edit, Camera } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommonBreadcrumb } from "@/components/ui/breadcrumb";
import SettingTab from "@/components/custom/ViewProfileTabs/SettingTab";

import { updateRecruiterProfile } from "@/services/recruiterService";
import { MSG09, MSG10 } from "@/constants/messages";

const recruiterSchema = z.object({
    companyName: z.string().min(2, "Tên công ty phải có ít nhất 2 ký tự"),
    phone: z.string().min(10, "SĐT phải ≥ 10 số").max(15, "SĐT tối đa 15 số"),
    website: z.string().optional(),
    industry: z.string().min(2, "Ngành nghề phải có ít nhất 2 ký tự"),
    companySize: z.string().min(1, "Vui lòng nhập quy mô công ty"),
    address: z.string().min(2, "Địa chỉ phải có ít nhất 2 ký tự"),
});

const RecruiterCompanyProfile = () => {
    const { user, refetchUser, isLoading } = useAuth();
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        companyName: "",
        phone: "",
        website: "",
        industry: "",
        companySize: "",
        address: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Image states
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | undefined>(undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user && !isEditMode) {
            setFormData({
                companyName: user.companyName || "",
                phone: user.phone || "",
                website: user.website || "",
                industry: user.industry || "",
                companySize: user.companySize || "",
                address: user.address || "",
            });
            setLogoPreview(user.companyLogo || undefined);
        }
    }, [user, isEditMode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleCameraClick = () => {
        fileInputRef.current?.click();
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
        setLogoFile(null);
        if (user) {
            setLogoPreview(user.companyLogo || undefined);
            setFormData({
                companyName: user.companyName || "",
                phone: user.phone || "",
                website: user.website || "",
                industry: user.industry || "",
                companySize: user.companySize || "",
                address: user.address || "",
            });
        }
        setErrors({});
    };

    const handleSaveProfile = async () => {
        const result = recruiterSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                fieldErrors[issue.path[0] as string] = issue.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            await updateRecruiterProfile({
                ...user,
                ...formData,
                companyLogo: logoFile,
            });

            await refetchUser();
            setIsEditMode(false);
            setLogoFile(null);
            toast.success(MSG09 || "Cập nhật hồ sơ thành công");
        } catch (error) {
            toast.error(MSG10 || "Cập nhật thất bại, vui lòng thử lại");
            console.log(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="mx-auto mt-5 max-w-7xl px-4 pb-12 md:px-10 bg-[#050816] min-h-screen text-white pt-10">
                <div className="mx-auto max-w-4xl">
                    <div className="rounded-lg border border-white/10 bg-[#11142D] p-6 shadow-sm">
                        <p className="text-sm text-gray-500">Đang tải thông tin...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!user || user.role !== "Recruiter") {
        return (
            <div className="mx-auto mt-5 max-w-7xl px-4 pb-12 md:px-10 bg-[#050816] min-h-screen text-white pt-10">
                <div className="mx-auto max-w-4xl">
                    <div className="rounded-lg border border-white/10 bg-[#11142D] p-6 shadow-sm">
                        <p className="text-sm text-gray-500">Không tìm thấy thông tin công ty hoặc bạn không phải là Nhà tuyển dụng.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050816] text-white">
            <div className="container mx-auto px-4 pb-16 pt-8 md:px-10 max-w-[1200px]">
                <CommonBreadcrumb />

                <div className="mx-auto mt-8 space-y-8 max-w-3xl">
                    <Card className="rounded-[16px] border border-white/10 bg-[#11142D] shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
                            <CardTitle className="flex items-center gap-2 text-xl text-white">
                                <Building size={24} className="text-[#8B5CF6]" />
                                Hồ sơ Công ty
                            </CardTitle>
                            {!isEditMode && (
                                <Button
                                    className="bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:brightness-110 text-white gap-2 cursor-pointer"
                                    onClick={() => setIsEditMode(true)}
                                >
                                    <Edit className="h-4 w-4" />
                                    Chỉnh sửa
                                </Button>
                            )}
                        </CardHeader>

                        <CardContent className="pt-6">
                            {isEditMode ? (
                                <div className="space-y-6">
                                    {/* Edit Logo */}
                                    <div className="flex flex-col items-center gap-4 sm:flex-row mb-6">
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                        <div className="relative h-24 w-24">
                                            <div
                                                className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl ring-2 ring-[#8B5CF6]/40 cursor-pointer bg-white transition hover:brightness-90"
                                                onClick={handleCameraClick}
                                            >
                                                {logoPreview ? (
                                                    <img src={logoPreview} className="h-full w-full object-contain p-2" alt="Company Logo" />
                                                ) : (
                                                    <Building className="h-10 w-10 text-gray-400" />
                                                )}
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                                                    <Camera className="h-6 w-6 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium mb-1">Logo công ty</h4>
                                            <p className="text-sm text-gray-400">Định dạng JPG, PNG hoặc GIF.</p>
                                            <Button variant="outline" size="sm" className="mt-2 text-white border-white/20 bg-transparent hover:bg-white/10 cursor-pointer" onClick={handleCameraClick}>
                                                Thay đổi Logo
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-gray-300">Tên công ty <span className="text-red-500">*</span></Label>
                                            <Input
                                                name="companyName"
                                                value={formData.companyName}
                                                onChange={handleChange}
                                                className="bg-[#0F1333] border-white/10 text-white focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20"
                                                placeholder="Nhập tên công ty"
                                            />
                                            {errors.companyName && <p className="text-red-400 text-xs mt-1">{errors.companyName}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-gray-300">Số điện thoại <span className="text-red-500">*</span></Label>
                                            <Input
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="bg-[#0F1333] border-white/10 text-white focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20"
                                                placeholder="Nhập số điện thoại"
                                            />
                                            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-gray-300">Lĩnh vực <span className="text-red-500">*</span></Label>
                                            <Input
                                                name="industry"
                                                value={formData.industry}
                                                onChange={handleChange}
                                                className="bg-[#0F1333] border-white/10 text-white focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20"
                                                placeholder="VD: Công nghệ thông tin, Tài chính..."
                                            />
                                            {errors.industry && <p className="text-red-400 text-xs mt-1">{errors.industry}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-gray-300">Quy mô công ty <span className="text-red-500">*</span></Label>
                                            <Input
                                                name="companySize"
                                                value={formData.companySize}
                                                onChange={handleChange}
                                                className="bg-[#0F1333] border-white/10 text-white focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20"
                                                placeholder="VD: 50-100 nhân viên"
                                            />
                                            {errors.companySize && <p className="text-red-400 text-xs mt-1">{errors.companySize}</p>}
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="text-gray-300">Website</Label>
                                            <Input
                                                name="website"
                                                value={formData.website}
                                                onChange={handleChange}
                                                className="bg-[#0F1333] border-white/10 text-white focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20"
                                                placeholder="https://example.com"
                                            />
                                            {errors.website && <p className="text-red-400 text-xs mt-1">{errors.website}</p>}
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="text-gray-300">Địa chỉ <span className="text-red-500">*</span></Label>
                                            <Input
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                className="bg-[#0F1333] border-white/10 text-white focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20"
                                                placeholder="Nhập địa chỉ công ty"
                                            />
                                            {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-white/10">
                                        <Button
                                            variant="outline"
                                            className="border-white/20 text-white hover:bg-white/5 cursor-pointer bg-transparent"
                                            onClick={handleCancelEdit}
                                            disabled={isSubmitting}
                                        >
                                            Hủy bỏ
                                        </Button>
                                        <Button
                                            onClick={handleSaveProfile}
                                            disabled={isSubmitting}
                                            className="bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:brightness-110 text-white cursor-pointer min-w-[120px]"
                                        >
                                            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* View Mode Logo and Name */}
                                    <div className="flex items-center gap-5">
                                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-white p-2 shadow-sm ring-1 ring-white/10">
                                            {user.companyLogo ? (
                                                <img src={user.companyLogo} alt="Company Logo" className="h-full w-full object-contain" />
                                            ) : (
                                                <Building className="h-10 w-10 text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white tracking-tight">
                                                {user.companyName || "Chưa cập nhật tên công ty"}
                                            </h3>
                                            {user.industry && (
                                                <span className="mt-1 inline-flex items-center rounded-full bg-[#8B5CF6]/15 px-2.5 py-0.5 text-xs font-semibold text-[#A78BFA] border border-[#8B5CF6]/20">
                                                    {user.industry}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Company Details Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 mt-6">
                                        {/* Industry */}
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 rounded-full bg-[#1A1D3D] p-2">
                                                <Briefcase size={18} className="text-[#A78BFA]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-400">Lĩnh vực</p>
                                                <p className="mt-1 text-base text-gray-200">{user.industry || "Chưa cập nhật"}</p>
                                            </div>
                                        </div>

                                        {/* Company Size */}
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 rounded-full bg-[#1A1D3D] p-2">
                                                <Users size={18} className="text-[#34D399]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-400">Quy mô công ty</p>
                                                <p className="mt-1 text-base text-gray-200">{user.companySize || "Chưa cập nhật"}</p>
                                            </div>
                                        </div>

                                        {/* Phone */}
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 rounded-full bg-[#1A1D3D] p-2">
                                                <Phone size={18} className="text-[#60A5FA]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-400">Số điện thoại</p>
                                                <p className="mt-1 text-base text-gray-200">{user.phone || "Chưa cập nhật"}</p>
                                            </div>
                                        </div>

                                        {/* Website */}
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 rounded-full bg-[#1A1D3D] p-2">
                                                <Globe size={18} className="text-[#FBBF24]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-400">Website</p>
                                                {user.website ? (
                                                    <a href={
                                                        user.website?.startsWith("http")
                                                            ? user.website
                                                            : `https://${user.website}`
                                                    } target="_blank" rel="noopener noreferrer" className="mt-1 block text-base text-[#A78BFA] hover:text-[#C4B5FD] hover:underline transition-colors break-all">
                                                        {user.website}
                                                    </a>
                                                ) : (
                                                    <p className="mt-1 text-base text-gray-200">Chưa cập nhật</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Address */}
                                        <div className="flex items-start gap-3 md:col-span-2">
                                            <div className="mt-1 rounded-full bg-[#1A1D3D] p-2">
                                                <MapPin size={18} className="text-[#F87171]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-400">Địa chỉ</p>
                                                <p className="mt-1 text-base text-gray-200 leading-relaxed max-w-2xl">{user.address || "Chưa cập nhật"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="mt-8">
                        <SettingTab />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruiterCompanyProfile;
