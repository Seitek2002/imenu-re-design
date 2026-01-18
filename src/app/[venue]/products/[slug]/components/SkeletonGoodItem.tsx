// import ImenuSquareSkeleton from '@/components/ui/ImenuSquareSkeleton';

// export default function SkeletonGoodItem() {
//   return (
//     <div className="w-full">
//       <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
//         <ImenuSquareSkeleton className="absolute inset-0 w-full h-full" roundedClassName="rounded-2xl" />
//       </div>

//       <div className="mt-2 space-y-2">
//         <svg className="block" width="90" height="16" role="img" aria-label="Загрузка цены...">
//           <defs>
//             <linearGradient id="goods-skeleton-price">
//               <stop offset="0%" stopColor="#f0f0f0">
//                 <animate attributeName="offset" values="-2; 1" dur="1.4s" repeatCount="indefinite" />
//               </stop>
//               <stop offset="50%" stopColor="#e6e6e6">
//                 <animate attributeName="offset" values="-1; 2" dur="1.4s" repeatCount="indefinite" />
//               </stop>
//               <stop offset="100%" stopColor="#f0f0f0">
//                 <animate attributeName="offset" values="0; 3" dur="1.4s" repeatCount="indefinite" />
//               </stop>
//             </linearGradient>
//           </defs>
//           <rect x="0" y="0" width="90" height="16" rx="8" fill="url(#goods-skeleton-price)" />
//         </svg>

//         <svg className="block" width="160" height="14" role="img" aria-label="Загрузка названия...">
//           <defs>
//             <linearGradient id="goods-skeleton-title">
//               <stop offset="0%" stopColor="#f0f0f0">
//                 <animate attributeName="offset" values="-2; 1" dur="1.4s" repeatCount="indefinite" />
//               </stop>
//               <stop offset="50%" stopColor="#e6e6e6">
//                 <animate attributeName="offset" values="-1; 2" dur="1.4s" repeatCount="indefinite" />
//               </stop>
//               <stop offset="100%" stopColor="#f0f0f0">
//                 <animate attributeName="offset" values="0; 3" dur="1.4s" repeatCount="indefinite" />
//               </stop>
//             </linearGradient>
//           </defs>
//           <rect x="0" y="0" width="160" height="14" rx="7" fill="url(#goods-skeleton-title)" />
//         </svg>

//         <svg className="block" width="64" height="12" role="img" aria-label="Загрузка веса...">
//           <defs>
//             <linearGradient id="goods-skeleton-weight">
//               <stop offset="0%" stopColor="#f0f0f0">
//                 <animate attributeName="offset" values="-2; 1" dur="1.4s" repeatCount="indefinite" />
//               </stop>
//               <stop offset="50%" stopColor="#e6e6e6">
//                 <animate attributeName="offset" values="-1; 2" dur="1.4s" repeatCount="indefinite" />
//               </stop>
//               <stop offset="100%" stopColor="#f0f0f0">
//                 <animate attributeName="offset" values="0; 3" dur="1.4s" repeatCount="indefinite" />
//               </stop>
//             </linearGradient>
//           </defs>
//           <rect x="0" y="0" width="64" height="12" rx="6" fill="url(#goods-skeleton-weight)" />
//         </svg>
//       </div>
//     </div>
//   );
// }
