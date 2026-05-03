import React, { useState, useEffect } from "react";
import { Trash2, Plus, Loader2, ChevronRight, Calendar as CalendarIcon, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { 
    getMyRecurringSlots, 
    deleteMentorRecurringSlot, 
    addMentorRecurringSlots 
} from "@/services/mentorSlotService";
import type { MentorRecurringSlotsResponse, MentorSlotDetailResponse } from "@/types/response/booking.response";
import AddSlotDialog from "@/components/mentor/AddSlotDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PIXEL_PER_HOUR = 64;
const SLOT_GAP_PX = 2;

const AvailabilityCalendar: React.FC = () => {
    const [slotsData, setSlotsData] = useState<MentorRecurringSlotsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [slotToDelete, setSlotToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const weekDays = [
        { label: "Thứ 2", short: "T2", value: 1 },
        { label: "Thứ 3", short: "T3", value: 2 },
        { label: "Thứ 4", short: "T4", value: 3 },
        { label: "Thứ 5", short: "T5", value: 4 },
        { label: "Thứ 6", short: "T6", value: 5 },
        { label: "Thứ 7", short: "T7", value: 6 },
        { label: "Chủ Nhật", short: "CN", value: 0 },
    ];

    const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8:00 to 22:00

    const fetchSlots = async () => {
        setIsLoading(true);
        try {
            const data = await getMyRecurringSlots();
            setSlotsData(data);
        } catch (error) {
            toast.error("Không thể tải danh sách khung giờ.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, []);

    const handleAddSlots = async (selectedSlotIds: number[]) => {
        setIsAdding(true);
        try {
            await addMentorRecurringSlots(selectedSlotIds);
            toast.success("Đã thêm các khung giờ mới.");
            await fetchSlots();
            setIsDialogOpen(false);
        } catch (error) {
            toast.error("Có lỗi xảy ra khi thêm khung giờ.");
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setSlotToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (slotToDelete === null) return;
        setIsDeleting(true);
        try {
            await deleteMentorRecurringSlot(slotToDelete);
            toast.success("Đã xóa khung giờ.");
            await fetchSlots();
        } catch (error) {
            toast.error("Không thể xóa khung giờ.");
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setSlotToDelete(null);
        }
    };

    const getSlotPosition = (startTime: string, endTime: string) => {
        const [startH, startM] = startTime.split(":").map(Number);
        const [endH, endM] = endTime.split(":").map(Number);
        
        const startMinutes = (startH - 8) * 60 + startM;
        const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
        
        return {
            top: (startMinutes / 60) * PIXEL_PER_HOUR,
            height: (durationMinutes / 60) * PIXEL_PER_HOUR - SLOT_GAP_PX
        };
    };

    const getAllSlotsFlat = (): MentorSlotDetailResponse[] => {
        if (!slotsData) return [];
        return slotsData.slotsByDay.flatMap(day => day.slots);
    };

    return (
        <div className="min-h-screen bg-[#0B0F19] text-white p-4 md:p-8">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-8">
                <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6 font-medium">
                    <Link to="/home" className="hover:text-indigo-400 transition-colors">Trang chủ</Link>
                    <ChevronRight size={14} />
                    <Link to="/mentor/interview-schedule" className="hover:text-indigo-400 transition-colors">Lịch phỏng vấn</Link>
                    <ChevronRight size={14} />
                    <span className="text-indigo-400">Quản lý lịch lặp lại</span>
                </nav>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#161B2C]/50 backdrop-blur-xl border border-white/5 p-8 rounded-3xl shadow-2xl">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <CalendarIcon size={32} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                Quản lý lịch lặp lại
                            </h1>
                            <p className="text-gray-400 mt-1 flex items-center gap-2 font-medium">
                                <Clock size={16} className="text-indigo-400" />
                                Thiết lập các khung giờ rảnh cố định hàng tuần của bạn
                            </p>
                        </div>
                    </div>
                    <Button 
                        onClick={() => setIsDialogOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-6 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus size={20} />
                        Thêm khung giờ
                    </Button>
                </div>
            </div>

            {/* Calendar Main Section */}
            <div className="max-w-7xl mx-auto bg-[#161B2C]/30 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden shadow-2xl flex flex-col">
                <div className="overflow-x-auto custom-scrollbar-h">
                    <div className="min-w-[800px] md:min-w-0">
                        {/* Header grid */}
                        <div className="grid grid-cols-[80px_repeat(7,1fr)] md:grid-cols-[100px_repeat(7,1fr)] border-b border-white/5 bg-[#1A1F35]/80">
                            <div className="p-4 border-r border-white/5"></div>
                            {weekDays.map(day => (
                                <div key={day.value} className="p-4 text-center border-r border-white/5 last:border-r-0">
                                    <span className="block text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">{day.short}</span>
                                    <span className="text-sm font-bold text-gray-200">{day.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Body grid */}
                        <div className="grid grid-cols-[80px_repeat(7,1fr)] md:grid-cols-[100px_repeat(7,1fr)] max-h-[700px] overflow-y-auto custom-scrollbar">
                            {/* Time labels column */}
                            <div className="bg-[#1A1F35]/30">
                                {hours.map(hour => (
                                    <div key={hour} className="h-16 border-b border-white/5 p-2 text-right">
                                        <span className="text-xs font-bold text-gray-500">{hour}:00</span>
                                    </div>
                                ))}
                            </div>

                            {/* Day columns */}
                            {weekDays.map(day => (
                                <div key={day.value} className="relative border-r border-white/5 last:border-r-0 min-h-[960px] bg-white/[0.01]">
                                    {/* Horizontal grid lines */}
                                    {hours.map(hour => (
                                        <div key={hour} className="h-16 border-b border-white/5"></div>
                                    ))}

                                    {/* Existing Slots */}
                                    {!isLoading && slotsData?.slotsByDay.find(d => d.dayOfWeek === day.value)?.slots.map(slot => {
                                        const pos = getSlotPosition(slot.slot.startTime, slot.slot.endTime);
                                        return (
                                            <div 
                                                key={slot.id}
                                                className="absolute left-1 right-1 bg-gradient-to-br from-indigo-500/90 to-indigo-600/90 border border-indigo-400/30 rounded-xl p-2 group transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-indigo-500/20 z-10 overflow-hidden"
                                                style={{ top: pos.top, height: pos.height }}
                                            >
                                                <div className="flex flex-col h-full justify-between">
                                                    <span className="text-[10px] font-bold text-white/90 leading-tight">
                                                        {slot.slot.startTime.substring(0, 5)} - {slot.slot.endTime.substring(0, 5)}
                                                    </span>
                                                    <button 
                                                        onClick={() => handleDeleteClick(slot.id)}
                                                        className="self-end opacity-0 group-hover:opacity-100 transition-all p-1.5 bg-white/10 hover:bg-red-500/80 rounded-lg text-white backdrop-blur-md"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        {isLoading && (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                                <p className="text-gray-400 font-medium animate-pulse">Đang tải lịch lặp lại...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            <AddSlotDialog 
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onAdd={handleAddSlots}
                isAdding={isAdding}
                existingSlots={getAllSlotsFlat()}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-[#1A1F35] border border-white/10 text-white rounded-3xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold flex items-center gap-2">
                            <AlertCircle className="text-red-500" />
                            Xóa khung giờ lặp lại?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            Hành động này sẽ xóa khung giờ rảnh cố định của bạn. 
                            Các buổi phỏng vấn đã được đặt trong khung giờ này sẽ KHÔNG bị ảnh hưởng, 
                            nhưng ứng viên sẽ không thể đặt lịch mới vào khung giờ này trong tương lai.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl py-6">
                            Hủy bỏ
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-500 text-white rounded-xl py-6 font-bold"
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 className="animate-spin" /> : "Xác nhận xóa"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AvailabilityCalendar;
