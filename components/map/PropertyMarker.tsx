"use client"

interface PropertyMarkerProps {
  price: number
  isSelected?: boolean
  onClick?: () => void
}

export function PropertyMarker({
  price,
  isSelected,
  onClick,
}: PropertyMarkerProps) {
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`
    }
    return `$${(price / 1000).toFixed(0)}K`
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-2 py-1 rounded-md text-xs font-semibold shadow-md transition-all
        ${
          isSelected
            ? "bg-primary text-primary-foreground scale-110"
            : "bg-white text-gray-900 hover:bg-gray-100"
        }
      `}
    >
      {formatPrice(price)}
    </button>
  )
}

// components/map/PropertyMarker.tsx
// components/map/PropertyMarker.tsx
// "use client"

// interface PropertyMarkerProps {
//   price: number
//   isSelected?: boolean
// }

// export function PropertyMarker({
//   price,
//   isSelected = false,
// }: PropertyMarkerProps) {
//   const formatPrice = (p: number) => {
//     if (p >= 1_000_000) return `$${(p / 1_000_000).toFixed(1)}M`
//     if (p >= 1_000) return `$${(p / 1_000).toFixed(0)}K`
//     return `$${p.toLocaleString()}`
//   }

//   return (
//     <div
//       className={`
//         px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg whitespace-nowrap
//         transition-all duration-200 cursor-pointer
//         ${
//           isSelected
//             ? "bg-primary text-primary-foreground scale-110 ring-2 ring-primary/50 ring-offset-2 shadow-xl"
//             : "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 hover:scale-105 hover:shadow-md"
//         }
//       `}
//     >
//       {formatPrice(price)}
//     </div>
//   )
// }
