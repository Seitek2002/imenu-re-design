import { FC, useEffect, useState } from 'react';

interface IProps {
  sheetOpen: boolean;
  closeSheet: () => void;
}

const DrawerCheckout: FC<IProps> = ({ sheetOpen, closeSheet }) => {
  const [sheetAnim, setSheetAnim] = useState(false);

  useEffect(() => {
    if (sheetOpen) {
      const id = requestAnimationFrame(() => setSheetAnim(true));
      return () => cancelAnimationFrame(id);
    } else {
      setSheetAnim(false);
    }
  }, [sheetOpen]);

  return (
    <div
      role='dialog'
      aria-modal='true'
      className={`fixed inset-0 z-50 ${
        sheetOpen || sheetAnim ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          sheetAnim ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeSheet}
      />
      {/* Sheet */}
      <div
        className='absolute inset-x-0 bottom-0'
        aria-label='Checkout bottom sheet'
      >
        <div
          className={`w-full bg-white rounded-t-2xl shadow-2xl p-4 transform transition-all duration-300 ease-out ${
            sheetAnim
              ? 'translate-y-0 opacity-100'
              : 'translate-y-full opacity-0'
          }`}
        >
          {/* Drag handle */}
          <div className='mx-auto mb-3 h-1.5 w-12 rounded-full bg-[#E5E7EB]' />
          {/* Placeholder: inner content will be implemented by you */}
          <div className='min-h-[40vh]'>
            {/* TODO: Form/summary UI goes here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawerCheckout;
