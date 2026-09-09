import React, { useState } from 'react';
import { useTimeBank } from '../../context/TimeBankContext';

export default function BookingModal() {
  const { 
    bookingModalState, 
    closeBookingModal, 
    confirmBooking, 
    user 
  } = useTimeBank();

  const { isOpen, member, skill } = bookingModalState;

  const [selectedDate, setSelectedDate] = useState('Saturday, 22 August');
  const [selectedTime, setSelectedTime] = useState('5:00 PM – 6:00 PM');
  const [selectedFormat, setSelectedFormat] = useState('Online');
  const [cost] = useState(1.0);

  if (!isOpen || !member) return null;

  const currentBalance = user.balance;
  const balanceAfter = Math.max(0, Number((currentBalance - cost).toFixed(1)));
  const canAfford = currentBalance >= cost;

  const handleConfirm = () => {
    confirmBooking({
      member,
      skill: skill || { title: 'General Mentorship Session', icon: 'school' },
      date: selectedDate,
      time: selectedTime,
      format: selectedFormat,
      cost
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={closeBookingModal}
        className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity"
      ></div>

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl glass-panel-elevated p-6 md:p-10 z-10 my-8 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pastel-mint/80 border border-primary/20 text-primary text-xs font-semibold mb-3">
            <span className="material-symbols-outlined text-[14px]">lock_clock</span>
            <span>Escrow Protected Exchange</span>
          </div>
          <h1 className="font-display-lg-mobile md:font-headline-md text-2xl md:text-3xl font-bold text-primary mb-2">
            Confirm Your Session
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant">
            Review the details before finalizing your skill swap.
          </p>
        </div>

        <hr className="border-t border-glass-border/60 mb-6" />

        {/* Booking Details */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3">
            <img 
              src={member.avatar} 
              alt={member.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div>
              <h2 className="font-headline-md text-lg font-bold text-on-surface">
                {skill?.title || skill?.name || 'Skill Exchange Session'}
              </h2>
              <p className="font-body-md text-xs text-on-surface-variant flex items-center gap-1">
                <span>with {member.name}</span>
                <span className="text-primary font-bold">• {member.role}</span>
              </p>
            </div>
          </div>

          {/* Interactive Date, Time, Format selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Date
              </label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-white/40 border border-glass-border rounded-xl px-3 py-2 text-xs font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Saturday, 22 August">Saturday, 22 August</option>
                <option value="Sunday, 23 August">Sunday, 23 August</option>
                <option value="Tuesday, 25 August">Tuesday, 25 August</option>
                <option value="Thursday, 27 August">Thursday, 27 August</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Time Slot
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full bg-white/40 border border-glass-border rounded-xl px-3 py-2 text-xs font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="10:00 AM – 11:00 AM">10:00 AM – 11:00 AM</option>
                <option value="2:00 PM – 3:00 PM">2:00 PM – 3:00 PM</option>
                <option value="5:00 PM – 6:00 PM">5:00 PM – 6:00 PM</option>
                <option value="7:00 PM – 8:00 PM">7:00 PM – 8:00 PM</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Format
              </label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full bg-white/40 border border-glass-border rounded-xl px-3 py-2 text-xs font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Online Video Call">Online Video Call</option>
                <option value="In-Person (Local Cafe)">In-Person (Local Cafe)</option>
                <option value="In-Person (Community Garden)">In-Person (Community Garden)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cost & Balance Summary */}
        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-glass-border space-y-3 mb-6">
          <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
            <span className="font-headline-md text-sm font-bold text-on-surface">Session Cost</span>
            <span className="font-headline-md text-base text-primary font-bold">{cost} Time Credit</span>
          </div>

          <div className="flex flex-col gap-1.5 text-xs">
            <div className="flex justify-between items-center text-on-surface-variant">
              <span>Current available balance:</span>
              <span className="font-semibold text-on-surface">{currentBalance.toFixed(1)} Time Credits</span>
            </div>
            <div className="flex justify-between items-center text-on-surface-variant">
              <span>After booking (moved to Escrow):</span>
              <span className="font-bold text-primary">{balanceAfter.toFixed(1)} Time Credits</span>
            </div>
          </div>

          <div className="mt-2 bg-pastel-mint/40 p-3 rounded-xl text-xs text-on-secondary-container flex items-start gap-2 border border-secondary-container/60">
            <span className="material-symbols-outlined text-logo-sage text-base mt-0.5 flex-shrink-0">
              info
            </span>
            <p className="font-label-sm text-xs leading-relaxed">
              Your Time Credit will be safely held in escrow and only transferred after the session is completed.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleConfirm}
            disabled={!canAfford}
            className={`w-full font-label-sm text-sm font-bold py-3.5 px-6 rounded-full shadow-md transition-all duration-300 flex justify-center items-center gap-2 ${
              canAfford
                ? 'bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 cursor-pointer active:scale-[0.99]'
                : 'bg-outline-variant/50 text-on-surface-variant cursor-not-allowed'
            }`}
          >
            <span>{canAfford ? 'Confirm Booking' : 'Insufficient Credits'}</span>
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
          </button>

          <button
            onClick={closeBookingModal}
            className="w-full bg-transparent border border-glass-border text-on-surface-variant hover:text-on-surface font-label-sm text-sm py-3 px-6 rounded-full hover:bg-white/30 transition-all text-center"
          >
            Go Back
          </button>
        </div>

        {/* Cancellation policy */}
        <div className="text-center mt-4">
          <p className="text-[11px] text-on-surface-variant/75">
            Sessions can be rescheduled or cancelled up to 24 hours in advance without credit penalty.
          </p>
        </div>
      </div>
    </div>
  );
}
