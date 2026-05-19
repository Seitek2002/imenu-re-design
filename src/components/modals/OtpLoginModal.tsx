'use client';

import {
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
  ClipboardEvent,
} from 'react';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import {
  formatPhoneInput,
  formatPhoneMasked,
  normalizePhoneForApi,
  parsePhoneInput,
} from '@/lib/helpers/phone';
import { getCountryById } from '@/lib/helpers/countryCodes';
import CountryCodeSelect from '@/components/ui/CountryCodeSelect';
import {
  AuthApiError,
  requestOtp,
  verifyOtp,
  type OtpRequestResult,
  type VerifyResult,
} from '@/lib/api/auth';
import { useAuthStore } from '@/store/auth';

interface Props {
  open: boolean;
  venueSlug?: string;
  /** Префилл — например, телефон из локального стора гостя. */
  initialPhone?: string;
  initialCountryId?: string;
  onClose: () => void;
  onSuccess?: (result: VerifyResult) => void;
}

type Stage = 'phone' | 'code';

const OTP_LENGTH = 4;

export default function OtpLoginModal({
  open,
  venueSlug,
  initialPhone,
  initialCountryId,
  onClose,
  onSuccess,
}: Props) {
  const setSession = useAuthStore((s) => s.setSession);

  const [stage, setStage] = useState<Stage>('phone');
  const [countryId, setCountryId] = useState(initialCountryId ?? 'KG');
  const [phoneDigits, setPhoneDigits] = useState(initialPhone ?? '');
  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const [otpRequest, setOtpRequest] = useState<OtpRequestResult | null>(null);
  const [codeDigits, setCodeDigits] = useState<string[]>(
    Array(OTP_LENGTH).fill(''),
  );
  const [verifying, setVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [resendIn, setResendIn] = useState(0);

  const codeRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEscapeKey(open, onClose);

  // Сброс при закрытии — иначе следующий вход покажется с заполненным кодом.
  useEffect(() => {
    if (!open) {
      setStage('phone');
      setRequesting(false);
      setRequestError(null);
      setOtpRequest(null);
      setCodeDigits(Array(OTP_LENGTH).fill(''));
      setVerifying(false);
      setOtpError(null);
      setAttemptsLeft(null);
      setResendIn(0);
    }
  }, [open]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn((v) => v - 1), 1000);
    return () => window.clearTimeout(t);
  }, [resendIn]);

  if (!open) return null;

  const country = getCountryById(countryId);
  const isPhoneValid = phoneDigits.length === country.length;
  const fullPhone = normalizePhoneForApi(phoneDigits, country.dial);

  const handlePhoneChange = (raw: string) => {
    const parsed = parsePhoneInput(raw, countryId);
    setCountryId(parsed.countryId);
    setPhoneDigits(parsed.digits);
    setRequestError(null);
  };

  const handleRequest = async () => {
    if (!isPhoneValid || requesting) return;
    setRequesting(true);
    setRequestError(null);
    try {
      const result = await requestOtp({
        phone: `+${fullPhone}`,
        venueSlug,
      });
      setOtpRequest(result);
      setResendIn(result.resendAfter);
      setStage('code');
      // фокус на первое поле кода
      window.setTimeout(() => codeRefs.current[0]?.focus(), 50);
    } catch (err) {
      setRequestError(translateRequestError(err));
    } finally {
      setRequesting(false);
    }
  };

  const handleResend = async () => {
    if (resendIn > 0 || requesting) return;
    setOtpError(null);
    setAttemptsLeft(null);
    setCodeDigits(Array(OTP_LENGTH).fill(''));
    await handleRequest();
  };

  const handleVerify = async (code: string) => {
    if (!otpRequest || code.length !== OTP_LENGTH || verifying) return;
    setVerifying(true);
    setOtpError(null);
    try {
      const result = await verifyOtp({
        requestId: otpRequest.requestId,
        phone: `+${fullPhone}`,
        code,
      });
      setSession({
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
        client: result.client,
      });
      onSuccess?.(result);
      onClose();
    } catch (err) {
      const parsed = translateVerifyError(err);
      setOtpError(parsed.message);
      if (parsed.attemptsLeft != null) setAttemptsLeft(parsed.attemptsLeft);
      // если код истёк / слишком много попыток — возвращаем на phone-stage.
      if (parsed.fatal) {
        setStage('phone');
        setOtpRequest(null);
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleCodeChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...codeDigits];
    next[idx] = digit;
    setCodeDigits(next);
    if (digit && idx < OTP_LENGTH - 1) codeRefs.current[idx + 1]?.focus();
    if (next.every((d) => d !== '')) {
      handleVerify(next.join(''));
    }
  };

  const handleCodeKey = (
    idx: number,
    e: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace' && !codeDigits[idx] && idx > 0) {
      codeRefs.current[idx - 1]?.focus();
    }
  };

  const handleCodePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, OTP_LENGTH);
    if (pasted.length === OTP_LENGTH) {
      const next = pasted.split('');
      setCodeDigits(next);
      codeRefs.current[OTP_LENGTH - 1]?.focus();
      handleVerify(pasted);
    }
  };

  return (
    <div className='fixed inset-0 z-200 flex items-end lg:items-center justify-center'>
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-300'
        onClick={onClose}
      />
      <div className='relative w-full lg:max-w-sm bg-white rounded-t-4xl lg:rounded-3xl p-6 pb-10 lg:pb-6 shadow-2xl animate-in slide-in-from-bottom-4 lg:zoom-in-95 duration-300'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-[#111111] font-bold text-lg'>
            {stage === 'phone' ? 'Вход в аккаунт' : 'Подтверждение'}
          </h2>
          <button
            onClick={onClose}
            className='w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F5F5] text-[#6B6B6B]'
            aria-label='Закрыть'
          >
            ✕
          </button>
        </div>

        {stage === 'phone' && (
          <>
            <p className='text-[#6B6B6B] text-sm mb-5'>
              Введите номер телефона — отправим SMS с кодом подтверждения.
            </p>

            <div className='flex items-center gap-2 bg-[#F5F5F5] rounded-2xl px-3 h-14 mb-1'>
              <CountryCodeSelect value={countryId} onChange={setCountryId} />
              <input
                type='tel'
                inputMode='numeric'
                autoFocus
                placeholder={country.placeholder}
                value={formatPhoneInput(phoneDigits, countryId)}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className='flex-1 bg-transparent outline-none text-[#111111] text-base'
              />
            </div>
            {requestError && (
              <p className='text-red-500 text-sm mt-2'>{requestError}</p>
            )}

            <button
              disabled={!isPhoneValid || requesting}
              onClick={handleRequest}
              className='mt-5 w-full py-4 rounded-2xl bg-[#111111] text-white font-semibold text-base disabled:opacity-40 transition-opacity'
            >
              {requesting ? 'Отправляем…' : 'Получить код'}
            </button>
          </>
        )}

        {stage === 'code' && otpRequest && (
          <>
            <p className='text-[#6B6B6B] text-sm mb-6'>
              Введите {OTP_LENGTH}-значный код, отправленный на{' '}
              {formatPhoneMasked(fullPhone)}
            </p>

            <div className='flex gap-3 justify-center mb-4'>
              {codeDigits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    codeRefs.current[i] = el;
                  }}
                  type='tel'
                  inputMode='numeric'
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKey(i, e)}
                  onPaste={handleCodePaste}
                  autoFocus={i === 0}
                  className='w-14 h-14 text-center text-xl font-bold text-[#111111] bg-[#F5F5F5] rounded-2xl outline-none border-2 border-transparent focus:border-[#111111] transition-colors'
                />
              ))}
            </div>

            {otpError && (
              <p className='text-red-500 text-sm text-center mb-3'>
                {otpError}
                {attemptsLeft != null && attemptsLeft > 0 && (
                  <> · Осталось попыток: {attemptsLeft}</>
                )}
              </p>
            )}

            <button
              disabled={verifying || codeDigits.some((d) => !d)}
              onClick={() => handleVerify(codeDigits.join(''))}
              className='w-full py-4 rounded-2xl bg-[#111111] text-white font-semibold text-base disabled:opacity-40 transition-opacity'
            >
              {verifying ? 'Проверяем…' : 'Подтвердить'}
            </button>

            <div className='mt-4 flex items-center justify-between text-[13px]'>
              <button
                type='button'
                onClick={() => {
                  setStage('phone');
                  setOtpRequest(null);
                  setCodeDigits(Array(OTP_LENGTH).fill(''));
                  setOtpError(null);
                }}
                className='text-[#6B6B6B] underline-offset-2 hover:underline'
              >
                Изменить номер
              </button>
              <button
                type='button'
                disabled={resendIn > 0 || requesting}
                onClick={handleResend}
                className='text-[#111111] font-medium disabled:text-[#9E9E9E]'
              >
                {resendIn > 0
                  ? `Отправить снова через ${resendIn} c`
                  : 'Отправить код снова'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function translateRequestError(err: unknown): string {
  if (err instanceof AuthApiError) {
    if (err.detail === 'invalid_phone') return 'Проверьте номер телефона';
    if (err.detail === 'rate_limited') {
      const retry = (err.data?.retryAfter ?? err.data?.retry_after) as
        | number
        | undefined;
      return retry
        ? `Слишком часто. Повторите через ${retry} c.`
        : 'Слишком часто. Попробуйте позже.';
    }
    if (err.detail === 'sms_gateway_unavailable') {
      return 'SMS-сервис временно недоступен';
    }
    return err.detail;
  }
  return 'Не удалось отправить код. Попробуйте ещё раз.';
}

function translateVerifyError(err: unknown): {
  message: string;
  attemptsLeft?: number;
  fatal?: boolean;
} {
  if (err instanceof AuthApiError) {
    if (err.detail === 'invalid_code') {
      const attemptsLeft = (err.data?.attemptsLeft ??
        err.data?.attempts_left) as number | undefined;
      return { message: 'Неверный код', attemptsLeft };
    }
    if (err.detail === 'expired') {
      return { message: 'Код истёк, запросите новый', fatal: true };
    }
    if (err.detail === 'request_not_found') {
      return { message: 'Сессия истекла, начните заново', fatal: true };
    }
    if (err.detail === 'too_many_attempts') {
      return {
        message: 'Слишком много попыток. Запросите новый код.',
        fatal: true,
      };
    }
    return { message: err.detail };
  }
  return { message: 'Ошибка проверки кода' };
}
