import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";
import { z } from "zod";
import { toast } from "react-toastify";
import { updateRecruiterProfile } from "@/services/recruiterService";
import type { User } from "@/types/common/auth";

const recruiterSchema = z.object({
    companyName: z.string().min(2, "Tên công ty phải ≥ 2 ký tự"),
    phone: z.string().min(10, "SĐT phải ≥ 10 số").max(15, "SĐT tối đa 15 số"),
    website: z.string().optional(),
    industry: z.string().min(2, "Ngành nghề phải ≥ 2 ký tự"),
    companySize: z.string().min(1, "Chọn quy mô công ty"),
    address: z.string().min(2, "Địa chỉ phải ≥ 2 ký tự"),
});

interface Props {
    data: User;
    onSubmit?: () => void;
}

const UpdateRecruiterDialog: React.FC<Props> = ({ data, onSubmit }) => {
    const [open, setOpen] = useState(false);

    const [formData, setFormData] = useState({
        companyName: "",
        website: "",
        industry: "",
        companySize: "",
        address: "",
        phone: "",
    });

    useEffect(() => {
        if (open && data) {
            setFormData({
                companyName: data.companyName || "",
                website: data.website || "",
                industry: data.industry || "",
                companySize: data.companySize || "",
                address: data.address || "",
                phone: data.phone || "",
            });
        }
    }, [open, data]);
const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const handleSubmit = async () => {
        try {
            const result = recruiterSchema.safeParse(formData);
            if (!result.success) {
                const fieldErrors: Record<string, string> = {};

                result.error.issues.forEach((issue) => {
                    const field = issue.path[0] as string;
                    fieldErrors[field] = issue.message;
                });

                setErrors(fieldErrors);
                return;
            }

            setErrors({});

            const { companyLogo, ...restData } = data;
            await updateRecruiterProfile({
                ...restData,
                ...formData,
            });

            toast.success("Cập nhật thông tin công ty thành công");

            await onSubmit?.();

            setOpen(false);
        } catch (err: any) {
            const message =
                err?.response?.data?.detail ||
                err?.response?.data?.title ||
                err?.message ||
                "Có lỗi xảy ra";

            toast.error(message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="h-7 w-7 p-0 bg-[#8B5CF6] hover:bg-[#7C3AED] cursor-pointer flex items-center justify-center">
                    <Edit className="h-4 w-4 text-white" />
                </Button>
            </DialogTrigger>

            <DialogContent className="bg-[#11142D] text-white border border-white/10 [&>button]:cursor-pointer">
                <DialogHeader>
                    <DialogTitle>Cập nhật thông tin công ty</DialogTitle>
                    <DialogDescription>
                        Chỉnh sửa thông tin công ty của bạn
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">

                    <div>
                        <Label>Tên công ty</Label>
                        <Input
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                        />
                        {errors.companyName && (
                            <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
                        )}
                    </div>

                    <div>
                        <Label>Phone</Label>
                        <Input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                        )}
                    </div>
                    <div>
                        <Label>Website</Label>
                        <Input
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <Label>Lĩnh vực</Label>
                        <Input
                            name="industry"
                            value={formData.industry}
                            onChange={handleChange}
                        />
                        {errors.industry && (
                            <p className="text-red-500 text-sm mt-1">{errors.industry}</p>
                        )}
                    </div>

                    <div>
                        <Label>Quy mô công ty</Label>
                        <Input
                            name="companySize"
                            value={formData.companySize}
                            onChange={handleChange}
                        />
                        {errors.companySize && (
                            <p className="text-red-500 text-sm mt-1">{errors.companySize}</p>
                        )}
                    </div>

                    <div>
                        <Label>Địa chỉ</Label>
                        <Input
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                        />
                        {errors.address && (
                            <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                        )}
                    </div>

                    <Button
                        onClick={handleSubmit}
                        className="w-full bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] cursor-pointer"
                    >
                        Lưu thay đổi
                    </Button>

                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateRecruiterDialog;