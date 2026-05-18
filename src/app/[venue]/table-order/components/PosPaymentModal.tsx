'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { useCheckout } from '@/store/checkout';
import { useClientBonus } from '@/lib/api/queries';
import { useCreatePosPaymentLink } from '@/lib/api/pos-orders';
import { normalizePhoneForApi, formatPhoneInput, parsePhoneInput } from '@/lib/helpers/phone';
import { getCountryById } from '@/lib/helpers/countryCodes';
import CountryCodeSelect from '@/components/ui/CountryCodeSelect';
import OtpModal from '@/components/ui/OtpModal';
import BonusAccrualBadge from '@/components/BonusAccrualBadge';
import { savePendingPosPayment } from '@/lib/payment-link-store';
import { useClientStore } from '@/store/client';
import { toMoneyNumber, subtractMoney, formatMoney } from '@/types/pos-order';

interface Props {
  open: boolean;
  onClose: () => void;
  orderId: number;
  remaining: string;
  venueSlug: string;
}

export default function PosPaymentModal({
  open,
  onClose,
  orderId,
  remaining,
  venueSlug,
}: Props) {
  const t = useTranslations('TableOrder');
  const { phone, setPhone, countryId, setCountryId } = useCheckout();
  const country = getCountryById(countryId);
  const saveClient = useClientStore((s) => s.saveClient);

  const fullPhone = phone ? `+${normalizePhoneForApi(phone, country.dial)}` : '';
  const { data: bonusData } = useClientBonus({ phone: fullPhone, venueSlug });
  const availableBonuses = bonusData?.bonus ?? 0;
  const remainingNum = toMoneyNumber(remaining);
  const maxDeductible = Math.floor(Math.min(availableBonuses, remainingNum * 0.5));

  const [bonusUsed, setBonusUsed] = useState(false);
  const [bonusValue, setBonusValue] = useState(0);
  const bonusToUse = bonusUsed
    ? Math.min(Math.max(0, bonusValue), maxDeductible)
    : 0;

  useEffect(() => {
    if (open) {
      setBonusUsed(false);
      setBonusValue(0);
    }
  }, [open]);

  const handleBonusToggle = () => {
    if (bonusUsed) {
      setBonusUsed(false);
      setBonusValue(0);
    } else {
      setBonusUsed(true);
      setBonusValue(maxDeductible);
    }
  };

  const finalToPayStr = subtractMoney(remaining, formatMoney(bonusToUse));
  const finalToPay = toMoneyNumber(finalToPayStr);

  const paymentMutation = useCreatePosPaymentLink();
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [pendingArgs, setPendingArgs] = useState<{
    orderId: number;
    phone: string;
    bonus?: number;
  } | null>(null);

  useEffect(() => {
    if (!open) {
      setOtpOpen(false);
      setOtpError(null);
      setPendingArgs(null);
      setError(null);
      setPhoneError(false);
    }
  }, [open]);

  const hashStorageKey = (rawPhone: string) =>
    `bonus_hash_${venueSlug}_${rawPhone}`;

  const handlePaymentSuccess = (res: { paymentUrl?: string; phoneVerificationHash?: string }, savedPhone: string) => {
    if (res.phoneVerificationHash) {
      try {
        localStorage.setItem(hashStorageKey(savedPhone), res.phoneVerificationHash);
      } catch {}
    }
    saveClient({ phone: savedPhone, countryId });
    if (res.paymentUrl) {
      // Flag a pending bonus refresh — read on next mount of CurrentOrderView
      // when the paygate redirects the user back to the table page.
      try {
        sessionStorage.setItem('bonus_refresh_pending', '1');
      } catch {}
      // Persist the link so we can offer "Resume payment" if the user cancels
      // on the gateway. Cleared by CurrentOrderView when remaining drops to 0
      // or TTL passes.
      savePendingPosPayment({
        posOrderId: orderId,
        paymentUrl: res.paymentUrl,
        savedAt: Date.now(),
      });
      window.location.href = res.paymentUrl;
    }
  };

  const onPay = async () => {
    setError(null);
    if (!phone) {
      setPhoneError(true);
      setError(t('payment.phoneRequired'));
      return;
    }
    if (phone.length !== country.length) {
      setPhoneError(true);
      setError(t('payment.phoneInvalid'));
      return;
    }
    setPhoneError(false);

    let savedHash: string | null = null;
    try {
      savedHash = localStorage.getItem(hashStorageKey(fullPhone));
    } catch {}

    const args = { orderId, phone: fullPhone, bonus: bonusToUse };
    try {
      const res = await paymentMutation.mutateAsync({
        ...args,
        ...(savedHash ? { hash: savedHash } : {}),
      });
      if (res.status === 'waiting_for_code') {
        setPendingArgs(args);
        setOtpError(null);
        setOtpOpen(true);
        return;
      }
      handlePaymentSuccess(res, fullPhone);
    } catch (err: unknown) {
      const errObj = err as { error?: string } | null;
      setError(errObj?.error || t('payment.unavailable'));
    }
  };

  const handleOtpConfirm = async (code: string) => {
    if (!pendingArgs) return;
    setOtpError(null);
    try {
      const res = await paymentMutation.mutateAsync({ ...pendingArgs, code });
      setOtpOpen(false);
      setPendingArgs(null);
      handlePaymentSuccess(res, pendingArgs.phone);
    } catch (err: unknown) {
      const errObj = err as { error?: string; message?: string } | null;
      setOtpError(
        errObj?.error || errObj?.message || t('payment.invalidCode'),
      );
    }
  };

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-200 flex items-end lg:items-center justify-center'>
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-300'
        onClick={onClose}
      />
      <div className='relative w-full lg:max-w-md bg-white rounded-t-4xl lg:rounded-3xl p-6 pb-10 lg:pb-6 shadow-2xl animate-in slide-in-from-bottom-4 lg:zoom-in-95 duration-300'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-bold text-[#111111]'>
            {t('payment.modalTitle')}
          </h2>
          <button
            onClick={onClose}
            aria-label='close'
            className='w-8 h-8 rounded-lg text-[#A4A4A4] flex items-center justify-center active:scale-95 transition-transform'
          >
            <X size={20} />
          </button>
        </div>

        <div className='flex flex-col gap-3'>
          {/* Phone */}
          <div>
            <label className={`text-xs font-medium mb-1 block ${phoneError ? 'text-red-400' : 'text-[#A4A4A4]'}`}>
              {t('payment.phoneLabel')}
            </label>
            <div className={`flex items-center rounded-xl py-2.5 px-3 gap-2 transition-colors ${phoneError ? 'bg-red-50 ring-1 ring-red-400' : 'bg-[#F5F5F5]'}`}>
              <CountryCodeSelect
                value={countryId}
                onChange={(id) => {
                  setCountryId(id);
                  const newLen = getCountryById(id).length;
                  if (phone.length > newLen) setPhone(phone.slice(0, newLen));
                }}
              />
              <input
                type='tel'
                inputMode='numeric'
                value={formatPhoneInput(phone, countryId)}
                onChange={(e) => {
                  const { digits, countryId: newId } = parsePhoneInput(e.target.value, countryId);
                  if (newId !== countryId) {
                    setCountryId(newId);
                    const newLen = getCountryById(newId).length;
                    if (phone.length > newLen) setPhone(phone.slice(0, newLen));
                  }
                  setPhone(digits);
                  if (digits) setPhoneError(false);
                }}
                placeholder={country.placeholder}
                className='bg-transparent outline-none text-[#111111] text-sm font-medium flex-1 min-w-0'
              />
            </div>
          </div>

          {/* Bonuses */}
          {availableBonuses > 0 && (
            <div className='bg-[#F5F5F5] rounded-xl py-3 px-4'>
              <div className='flex items-center justify-between'>
                <div className='flex flex-col'>
                  <span className='text-sm font-bold text-[#111] leading-tight'>
                    {t('payment.bonusLabel')}
                  </span>
                  <span className='text-[10px] text-gray-500'>
                    {t('payment.bonusAvailableShort', { amount: availableBonuses })}
                  </span>
                </div>
                <button
                  type='button'
                  onClick={handleBonusToggle}
                  disabled={maxDeductible <= 0}
                  aria-label={t('payment.bonusLabel')}
                  className={`relative w-10 h-6 rounded-full transition-colors duration-300 disabled:opacity-50 ${
                    bonusUsed ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300 ${
                      bonusUsed ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              {bonusUsed && maxDeductible > 0 && (
                <div className='mt-3 border-t border-dashed border-gray-200 pt-2'>
                  <input
                    type='range'
                    min={0}
                    max={maxDeductible}
                    step={1}
                    value={bonusToUse}
                    onChange={(e) => setBonusValue(Number(e.target.value))}
                    className='w-full accent-brand cursor-pointer'
                  />
                  <div className='mt-1 flex justify-between text-xs text-brand font-medium'>
                    <span>{t('payment.bonusDiscount')}</span>
                    <span>− {bonusToUse} {t('currency')}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Summary */}
          <div className='bg-[#FAFAFA] border border-[#E7E7E7] rounded-xl p-3 text-sm flex flex-col gap-1.5'>
            <div className='flex justify-between text-[#6B6B6B]'>
              <span>{t('payment.checkSum')}</span>
              <span>
                {remaining} {t('currency')}
              </span>
            </div>
            {bonusToUse > 0 && (
              <div className='flex justify-between text-brand'>
                <span>{t('payment.bonusApplied')}</span>
                <span>
                  −{bonusToUse} {t('currency')}
                </span>
              </div>
            )}
            <div className='flex justify-between font-bold text-[#111111] pt-1.5 border-t border-[#E7E7E7]'>
              <span>{t('payment.toPay')}</span>
              <span>
                {finalToPayStr} {t('currency')}
              </span>
            </div>
          </div>

          <BonusAccrualBadge total={finalToPay} />

          {error && (
            <div className='bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3'>
              {error}
            </div>
          )}

          <button
            onClick={onPay}
            disabled={paymentMutation.isPending || finalToPay <= 0}
            className='w-full bg-green-500 text-white font-bold h-12 rounded-xl active:scale-95 transition-transform shadow-md disabled:opacity-50'
          >
            {paymentMutation.isPending
              ? t('payment.creating')
              : t('payment.pay', { amount: finalToPayStr })}
          </button>
        </div>
      </div>

      <OtpModal
        open={otpOpen}
        phone={fullPhone.replace(/^\+?/, '')}
        isLoading={paymentMutation.isPending}
        error={otpError}
        onConfirm={handleOtpConfirm}
        onClose={() => {
          setOtpOpen(false);
          setPendingArgs(null);
          setOtpError(null);
        }}
      />
    </div>
  );
}
