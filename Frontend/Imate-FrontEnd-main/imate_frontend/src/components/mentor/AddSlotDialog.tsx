import React, { useState, useEffect } from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Plus, FilterX } from "lucide-react";
import { getAllSlots } from "@/services/mentorSlotService";
import type { SlotDetailResponse, MentorSlotDetailResponse } from "@/types/response/booking.response";
import { cn } from "@/lib/utils";

interface AddSlotDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (slotIds: number[]) => Promise<void>;
    isAdding: boolean;
    existingSlots: MentorSlotDetailResponse[];
}

const AddSlotDialog: React.FC<AddSlotDialogProps> = ({ 
    isOpen, 
    onClose, 
    onAdd, 
    isAdding,
    existingSlots 
}) => {
    const [allSlots, setAllSlots] = useState<SlotDetailResponse[]>([]);
    const [selectedSlotIds, setSelectedSlotIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const weekDays = [
        { label: "Thứ 2", value: 1 },
        { label: "Thứ 3", value: 2 },
        { label: "Thứ 4", value: 3 },
        { label: "Thứ 5", value: 4 },
        { label: "Thứ 6", value: 5 },
        { label: "Thứ 7", value: 6 },
        { label: "Chủ Nhật", value: 0 },
    ];

    useEffect(() => {
        if (isOpen) {
            const fetchAll = async () => {
                setIsLoading(true);
                try {
                    const data = await getAllSlots();
                    setAllSlots(data);
                } catch (error) {
                    console.error("Failed to fetch slots", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchAll();
            setSelectedSlotIds([]);
        }
    }, [isOpen]);

    const toggleSlot = (id: number) => {
        setSelectedSlotIds(prev => 
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const isSlotExisting = (slotId: number) => {
        return existingSlots.some(s => s.slotId === slotId);
    };

    const handleAdd = async () => {
        if (selectedSlotIds.length === 0) return;
        await onAdd(selectedSlotIds);
    };


    const handleSelectAllForDay = (dayValue: number) => {
        const slotsForDay = allSlots.filter(s => s.dayOfWeek === dayValue && !isSlotExisting(s.id));
        const additionalIds = slotsForDay.map(s => s.id);
        setSelectedSlotIds(prev => Array.from(new Set([...prev, ...additionalIds])));
    };

    const handleDeselectAllForDay = (dayValue: number) => {
        const slotsForDay = allSlots.filter(s => s.dayOfWeek === dayValue);
        const dayIds = slotsForDay.map(s => s.id);
        setSelectedSlotIds(prev => prev.filter(id => !dayIds.includes(id)));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#0B0F19] border border-white/10 text-white w-[98vw] max-w-[1600px] rounded-[2rem] overflow-hidden p-0 shadow-2xl flex flex-col h-[90vh] md:h-[800px] !max-w-[98vw]">
                {/* Header */}
                <div className="p-6 md:p-10 pb-6 border-b border-white/5 bg-[#111625]/50 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <DialogTitle className="text-2xl md:text-4xl font-black tracking-tight text-white flex items-center gap-4">
                            Thiết lập lịch lặp lại
                            <span className="text-sm bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-2xl border border-indigo-500/20 font-bold">
                                {selectedSlotIds.length} khung giờ đã chọn
                            </span>
                        </DialogTitle>
                        <DialogDescription className="text-gray-400 font-medium text-sm md:text-base">
                            Sử dụng lưới bên dưới để nhanh chóng thiết lập các khung giờ rảnh cố định cho toàn bộ tuần.
                        </DialogDescription>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                        {selectedSlotIds.length > 0 && (
                            <Button 
                                variant="ghost" 
                                onClick={() => setSelectedSlotIds([])}
                                className="text-gray-500 hover:text-red-400 font-bold uppercase tracking-widest text-xs"
                            >
                                <FilterX size={16} className="mr-2" />
                                Xóa tất cả
                            </Button>
                        )}
                        <div className="flex gap-3">
                            <Button 
                                variant="ghost" 
                                onClick={onClose}
                                className="text-gray-400 hover:text-white rounded-2xl px-8 h-14 font-bold text-base"
                            >
                                Đóng
                            </Button>
                            <Button 
                                onClick={handleAdd}
                                disabled={selectedSlotIds.length === 0 || isAdding}
                                className="bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-2xl px-12 h-14 font-black shadow-2xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] text-base"
                            >
                                {isAdding ? (
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Đang lưu...</span>
                                    </div>
                                ) : (
                                    `Xác nhận lưu (${selectedSlotIds.length})`
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Weekly Grid */}
                <div className="flex-1 overflow-x-auto overflow-y-hidden bg-[#0F1423]/30 custom-scrollbar-h p-4 md:p-8">
                    <div className="flex gap-4 min-w-[1400px] h-full">
                        {weekDays.map(day => {
                            const daySlots = allSlots.filter(s => s.dayOfWeek === day.value);
                            const selectedCount = daySlots.filter(s => selectedSlotIds.includes(s.id)).length;
                            
                            return (
                                <div key={day.value} className="flex-1 flex flex-col bg-[#161B2C]/50 rounded-3xl border border-white/5 overflow-hidden shadow-xl min-w-[180px]">
                                    {/* Day Column Header */}
                                    <div className={cn(
                                        "p-4 border-b border-white/5 flex flex-col gap-3",
                                        selectedCount > 0 ? "bg-indigo-600/10" : "bg-white/[0.02]"
                                    )}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-black text-indigo-400 uppercase tracking-[0.15em] shrink-0">
                                                {day.label}
                                            </span>
                                            {selectedCount > 0 && (
                                                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-500 text-[10px] font-black text-white shadow-lg">
                                                    {selectedCount}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleSelectAllForDay(day.value)}
                                                className="flex-1 text-[10px] font-bold py-1.5 px-2 bg-white/5 hover:bg-indigo-500/20 text-gray-400 hover:text-indigo-400 rounded-lg transition-all border border-transparent hover:border-indigo-500/20"
                                            >
                                                Chọn hết
                                            </button>
                                            <button 
                                                onClick={() => handleDeselectAllForDay(day.value)}
                                                className="text-[10px] font-bold py-1.5 px-2 bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg transition-all border border-transparent hover:border-red-500/20"
                                            >
                                                <FilterX size={10} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Vertical Slots List for this Day */}
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                                        {isLoading ? (
                                            <div className="flex flex-col items-center justify-center h-full gap-2 py-10">
                                                <Loader2 className="animate-spin text-indigo-500/40" size={24} />
                                            </div>
                                        ) : daySlots.map(slot => {
                                            const existing = isSlotExisting(slot.id);
                                            const selected = selectedSlotIds.includes(slot.id);
                                            
                                            return (
                                                <button
                                                    key={slot.id}
                                                    disabled={existing}
                                                    onClick={() => toggleSlot(slot.id)}
                                                    className={cn(
                                                        "w-full p-3 rounded-2xl border transition-all flex flex-col items-center gap-1 group relative overflow-hidden",
                                                        existing 
                                                            ? "bg-[#1E243A]/30 border-transparent opacity-40 cursor-not-allowed" 
                                                            : selected
                                                                ? "bg-indigo-600 border-indigo-400 shadow-xl shadow-indigo-600/20"
                                                                : "bg-[#1E243A]/50 border-white/5 hover:border-indigo-500/50 hover:bg-[#252B46]"
                                                    )}
                                                >
                                                    <span className={cn(
                                                        "text-xs font-bold whitespace-nowrap",
                                                        selected ? "text-white" : "text-gray-300"
                                                    )}>
                                                        {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                                                    </span>
                                                    {existing ? (
                                                        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-tighter opacity-80">Đã có</span>
                                                    ) : selected ? (
                                                        <Check size={12} className="text-white mt-1" />
                                                    ) : (
                                                        <Plus size={12} className="text-gray-600 group-hover:text-indigo-400/80 mt-1" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Legend */}
                <div className="p-6 border-t border-white/5 bg-[#111625]/80 shrink-0 flex items-center justify-center gap-12">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-md bg-[#1E243A]/50 border border-white/5"></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Khung giờ trống</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-md bg-indigo-600 border border-indigo-400 shadow-lg shadow-indigo-600/20"></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Đang được chọn</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-md bg-[#1E243A]/30 opacity-40 border border-transparent"></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Đã có trong lịch</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddSlotDialog;
