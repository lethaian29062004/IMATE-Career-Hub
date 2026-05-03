import React, { useEffect, useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, Edit } from "lucide-react";
import type { BankInfo } from "@/types/common/data";
import { getBankList, updateMentorProfile } from "@/services/mentorService";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { User } from "@/types/common/auth";
import { toast } from "react-toastify";

// ================= Zod Schemas =================
const priceSchema = z.object({
  pricePerSession: z
    .string()
    .min(1, "Vui lòng nhập giá phiên")
    .refine((v) => parseInt(v) > 0, "Giá phải lớn hơn 0"),
});

const personalSchema = z.object({
  phone: z
    .string()
    .min(10, "Số điện thoại không hợp lệ")
    .max(10, "Số điện thoại không được vượt quá 10 số")
    .regex(/^[0-9]+$/, "Số điện thoại chỉ được chứa số"),
});

const bankSchema = z.object({
  bankAccountHolderName: z.string().min(1, "Vui lòng nhập tên chủ tài khoản"),
  bankAccountNumber: z
    .string()
    .min(6, "Số tài khoản phải có ít nhất 6 ký tự")
    .regex(/^[0-9]+$/, "Số tài khoản chỉ được chứa số"),
  bankCode: z.string().min(1, "Vui lòng chọn ngân hàng"),
});

const bioSchema = z.object({
  bio: z.string().min(10, "Giới thiệu ít nhất 10 ký tự").max(500, "Giới thiệu tối đa 500 ký tự"),
});

type UpdateType = "price" | "personal" | "bank" | "bio";

interface UpdateMentorDialogProps {
  type: UpdateType;
  data: User;
  onSubmit?: (data: any) => Promise<void> | void;
}

const UpdateMentorDialog: React.FC<UpdateMentorDialogProps> = ({ type, onSubmit, data }) => {
  const [banks, setBanks] = useState<BankInfo[]>([]);
  const [selectedBank, setSelectedBank] = useState<BankInfo | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [openBankSelect, setOpenBankSelect] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    pricePerSession: "",
    phone: "",
    bankAccountHolderName: "",
    bankAccountNumber: "",
    bankCode: "",
    bio: "",
  });

  // Khi dialog mở thì load dữ liệu ban đầu
  useEffect(() => {
    if (open && data) {
      setFormData({
        pricePerSession: data.pricePerSession?.toString() || "",
        phone: data.phone || "",
        bankAccountHolderName: data.bankAccountHolderName || "",
        bankAccountNumber: data.bankAccountNumber || "",
        bankCode: data.bankCode || "",
        bio: data.bio || "",
      });
      setErrors({});
    }
  }, [open, data]);

  // Lấy danh sách ngân hàng
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await getBankList();
        setBanks(res);
      } catch (err) {
        console.error("Lỗi khi tải danh sách ngân hàng:", err);
      }
    };
    fetchBanks();
  }, []);

  useEffect(() => {
    if (formData.bankCode && banks.length > 0) {
      const found = banks.find((b) => b.code === formData.bankCode) || null;
      setSelectedBank(found);
    }
  }, [formData.bankCode, banks]);

  const filteredBanks = banks.filter((bank) => !searchText || bank.name.toLowerCase().includes(searchText.toLowerCase()) || bank.code.toLowerCase().includes(searchText.toLowerCase()));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    try {
      let schema;
      let dataToValidate;

      //   Dùng type để validate cho từng form thông tin
      switch (type) {
        case "price":
          schema = priceSchema;
          dataToValidate = { pricePerSession: formData.pricePerSession };
          break;
        case "personal":
          schema = personalSchema;
          dataToValidate = { phone: formData.phone };
          break;
        case "bank":
          schema = bankSchema;
          dataToValidate = {
            bankAccountHolderName: formData.bankAccountHolderName,
            bankAccountNumber: formData.bankAccountNumber,
            bankCode: formData.bankCode,
          };
          break;
        case "bio":
          schema = bioSchema;
          dataToValidate = { bio: formData.bio };
          break;
        default:
          return;
      }

      const validated = schema.parse(dataToValidate);
      setErrors({});

      const updateData = { ...data };

      //Dùng type để biết sẽ update những field nào cho nhóm thông tin nào
      if (type === "price") {
        updateData.pricePerSession = Number(formData.pricePerSession);
      } else if (type === "personal") {
        updateData.phone = formData.phone;
      } else if (type === "bank") {
        updateData.bankAccountHolderName = formData.bankAccountHolderName;
        updateData.bankAccountNumber = formData.bankAccountNumber;
        updateData.bankCode = formData.bankCode;
      } else if (type === "bio") {
        updateData.bio = formData.bio;
      }

      await updateMentorProfile(updateData); // Call API

      toast.success("Cập nhật thành công");
      await onSubmit?.(validated); //Refetch data
      setOpen(false);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.issues.forEach((e) => {
          if (e.path[0]) newErrors[e.path[0].toString()] = e.message;
        });
        setErrors(newErrors);
      } else {
        console.error(err);
        toast.error("Cập nhật thất bại. Vui lòng thử lại.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {type === "price" ? (
          <Button className="h-7 w-7 p-0 cursor-pointer bg-green-500 hover:bg-green-500/50 flex items-center justify-center">
            <Edit className="h-4 w-4 text-white" />
          </Button>
        ) : (
          <Button className="h-7 w-7 p-0 cursor-pointer bg-[#8B5CF6] hover:bg-[#7C3AED] flex items-center justify-center">
            <Edit className="h-4 w-4 text-white" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md border border-white/10 bg-[#11142D] text-white shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
        <DialogHeader>
          <DialogTitle>
            {type === "price" && "Cập nhật giá phiên"}
            {type === "personal" && "Cập nhật thông tin cá nhân"}
            {type === "bank" && "Cập nhật thông tin ngân hàng"}
            {type === "bio" && "Cập nhật giới thiệu"}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {type === "price" && (
            <>
              <div className="space-y-1">
                <Label htmlFor="pricePerSession">Giá mỗi phiên (VNĐ)</Label>
                <Input id="pricePerSession" name="pricePerSession" type="number" placeholder="Nhập giá phiên..." value={formData.pricePerSession} onChange={handleChange} />
                {errors.pricePerSession && <p className="text-sm text-red-500">{errors.pricePerSession}</p>}
              </div>

              <Card className="border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20">
                <CardContent className="p-3 text-sm text-yellow-700 dark:text-yellow-400">
                  Lưu ý: Chỉ được cập nhật lại giá phiên sau <b>1 tuần</b> kể từ lần thay đổi gần nhất.
                </CardContent>
              </Card>
            </>
          )}

          {type === "personal" && (
            <div className="space-y-1">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" name="phone" type="tel" placeholder="Nhập số điện thoại..." value={formData.phone} onChange={handleChange} />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>
          )}

          {type === "bank" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <Label htmlFor="bankAccountHolderName">Tên chủ tài khoản</Label>
                <Input id="bankAccountHolderName" name="bankAccountHolderName" placeholder="Nhập tên chủ tài khoản..." value={formData.bankAccountHolderName} onChange={handleChange} />
                {errors.bankAccountHolderName && <p className="text-sm text-red-500">{errors.bankAccountHolderName}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="bankAccountNumber">Số tài khoản</Label>
                <Input id="bankAccountNumber" name="bankAccountNumber" placeholder="Nhập số tài khoản..." value={formData.bankAccountNumber} onChange={handleChange} />
                {errors.bankAccountNumber && <p className="text-sm text-red-500">{errors.bankAccountNumber}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="bankCode">Ngân hàng</Label>
                <Popover open={openBankSelect} onOpenChange={setOpenBankSelect} modal={false}>
                  <PopoverTrigger asChild>
                    <button type="button" className="flex w-full cursor-pointer items-center justify-between rounded-md border border-white/10 bg-[#0F1333] px-4 py-3 text-left text-sm transition hover:border-white/20 focus:outline-none">
                      <div className="flex items-center gap-3 truncate">
                        {selectedBank ? (
                          <>
                            <img
                              src={selectedBank.logo}
                              alt={selectedBank.name}
                              className="h-8 w-8 rounded-md border border-white/10 bg-white object-contain p-1"
                            />

                            <div className="flex flex-col truncate">
                              <span className="truncate text-[15px] font-medium text-white">
                                {selectedBank.name}
                              </span>

                              <span className="text-xs text-[#A0A3BD]">
                                {selectedBank.code}
                              </span>
                            </div>
                          </>
                        ) : (
                          <span className="text-[#A0A3BD]">Chọn ngân hàng</span>
                        )}
                      </div>

                      <ChevronDown className="h-4 w-4 text-[#A0A3BD]" />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent align="start" onWheel={(e: React.WheelEvent) => e.stopPropagation()} className="hide-scrollbar z-[100] w-[var(--radix-popover-trigger-width)] border border-white/10 bg-[#11142D] p-0 shadow-xl" sideOffset={5}>
                    <div className="sticky top-0 z-10 rounded-t-md border-b border-white/10 bg-[#11142D] p-3">
                      <Input placeholder="Tìm kiếm tên hoặc mã ngân hàng..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="border-white/10 bg-[#0F1333] text-white placeholder:text-[#A0A3BD]" />
                    </div>

                    <div className="max-h-[280px] overflow-y-auto p-2">
                      {filteredBanks.length === 0 ? (
                        <p className="p-2 text-center text-sm text-gray-500">Không tìm thấy ngân hàng</p>
                      ) : (
                        <div className="space-y-1">
                          {filteredBanks.map((bank) => (
                            <button
                              key={bank.code}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-[#1A1D45]"
                              onClick={() => {
                                setSelectedBank(bank);
                                setFormData((prev) => ({
                                  ...prev,
                                  bankCode: bank.code,
                                }));
                                setOpenBankSelect(false);
                                setSearchText("");
                                setErrors((prev) => ({ ...prev, bankCode: "" }));
                              }}
                              type="button"
                            >
                              <img src={bank.logo} alt={bank.name} className="h-10 w-10 rounded-md border border-white/10 bg-white object-contain p-1" />
                              <div className="flex min-w-0 flex-1 flex-col">
                                <span className="truncate text-sm font-medium text-white">
                                  {bank.name}
                                </span>

                                <span className="text-xs text-[#A0A3BD]">
                                  {bank.code}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                {errors.bankCode && <p className="text-sm text-red-500">{errors.bankCode}</p>}
              </div>
            </div>
          )}

          {type === "bio" && (
            <div className="space-y-1">
              <Label htmlFor="bio">Giới thiệu</Label>
              <Textarea id="bio" name="bio" rows={4} placeholder="Viết đôi lời giới thiệu về bản thân..." value={formData.bio} onChange={handleChange} className="min-h-[80px] w-full resize-none overflow-auto break-words" />
              {errors.bio && <p className="text-sm text-red-500">{errors.bio}</p>}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" className="cursor-pointer" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button className="cursor-pointer bg-[#5D5FEF] text-white hover:bg-indigo-400" onClick={handleSubmit}>
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateMentorDialog;
