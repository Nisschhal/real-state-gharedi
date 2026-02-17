// "use client"

// import Link from "next/link"
// import { useCallback, useEffect, useRef, useState } from "react"
// import MapGL, { Marker, NavigationControl, Popup } from "react-map-gl/mapbox"
// import "mapbox-gl/dist/mapbox-gl.css"
// import type { Property } from "@/types"

// interface MapViewProps {
//   properties: Property[]
//   onPropertyClick?: (property: Property) => void
//   className?: string
// }

// export function MapView({
//   properties,
//   onPropertyClick,
//   className,
// }: MapViewProps) {
//   const [selectedProperty, setSelectedProperty] = useState<Property | null>(
//     null,
//   )
//   const [viewState, setViewState] = useState({
//     longitude: -98.5795,
//     latitude: 39.8283,
//     zoom: 4,
//   })

//   const hasCenteredRef = useRef(false)

//   // Calculate bounds from properties if they exist
//   const validProperties = properties.filter(
//     (p) => p.location?.lat && p.location?.lng,
//   )

//   // Center on first property when properties load (only once)
//   useEffect(() => {
//     if (hasCenteredRef.current) return
//     if (validProperties.length > 0) {
//       const firstProperty = validProperties[0]
//       if (firstProperty.location) {
//         setViewState({
//           longitude: firstProperty.location.lng,
//           latitude: firstProperty.location.lat,
//           zoom: 10,
//         })
//         hasCenteredRef.current = true
//       }
//     }
//   }, [validProperties])

//   const handleMarkerClick = useCallback(
//     (property: Property) => {
//       setSelectedProperty(property)
//       if (onPropertyClick) {
//         onPropertyClick(property)
//       }
//     },
//     [onPropertyClick],
//   )

// const formatPrice = (price: number) => {
//   return new Intl.NumberFormat("en-US", {
//     style: "currency",
//     currency: "USD",
//     maximumFractionDigits: 0,
//   }).format(price)
// }

//   return (
//     <div className={className ?? "w-full h-full"}>
//       <MapGL
//         {...viewState}
//         onMove={(evt) => setViewState(evt.viewState)}
//         style={{ width: "100%", height: "100%" }}
//         mapStyle="mapbox://styles/mapbox/streets-v12"
//         mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
//       >
//         <NavigationControl position="top-right" />

//         {validProperties.map((property) => (
//           <Marker
//             key={property._id}
//             longitude={property.location?.lng ?? 0}
//             latitude={property.location?.lat ?? 0}
//             anchor="bottom"
//             onClick={(e) => {
//               e.originalEvent.stopPropagation()
//               handleMarkerClick(property)
//             }}
//           >
// <div className="cursor-pointer">
//   <div className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-semibold shadow-md hover:bg-primary/90 transition-colors">
//     {formatPrice(property.price)}
//   </div>
// </div>
//           </Marker>
//         ))}

// {selectedProperty?.location && (
//   <Popup
//     longitude={selectedProperty.location.lng}
//     latitude={selectedProperty.location.lat}
//     anchor="bottom"
//     onClose={() => setSelectedProperty(null)}
//     closeButton={true}
//     closeOnClick={false}
//     className="property-popup"
//   >
//     <Link
//       href={`/properties/${selectedProperty._id}`}
//       className="block p-2 min-w-[200px] hover:bg-muted/50 transition-colors rounded-md cursor-pointer"
//     >
//       <h3 className="font-semibold text-sm">
//         {selectedProperty.title}
//       </h3>
//       <p className="text-lg font-bold text-primary">
//         {formatPrice(selectedProperty.price)}
//       </p>
//       <div className="flex gap-2 text-xs text-muted-foreground mt-1">
//         <span>{selectedProperty.bedrooms} beds</span>
//         <span>•</span>
//         <span>{selectedProperty.bathrooms} baths</span>
//         {selectedProperty.squareFeet && (
//           <>
//             <span>•</span>
//             <span>
//               {selectedProperty.squareFeet.toLocaleString()} sqft
//             </span>
//           </>
//         )}
//       </div>
//       {selectedProperty.address && (
//         <p className="text-xs text-muted-foreground mt-1">
//           {selectedProperty.address.city},{" "}
//           {selectedProperty.address.state}
//         </p>
//       )}
//     </Link>
//   </Popup>
// )}
//       </MapGL>
//     </div>
//   )
// }

// components/map/MapView.tsx
// components/map/MapView.tsx
// components/map/MapView.tsx
"use client"

import { useCallback, useMemo, useState } from "react"
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import type { Property } from "@/types" // ← change to your real type path
import Link from "next/link"

interface MapViewProps {
  properties: Property[]
  onPropertyClick?: (property: Property) => void
}

export function MapView({ properties, onPropertyClick }: MapViewProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  )

  const validProperties = useMemo(
    () =>
      properties.filter(
        (p) =>
          typeof p.location?.lat === "number" &&
          typeof p.location?.lng === "number",
      ),
    [properties],
  )

  // const formatPrice = (price: number) => {
  //   return new Intl.NumberFormat("en-US", {
  //     style: "currency",
  //     currency: "USD",
  //     maximumFractionDigits: 0,
  //   }).format(price)
  // }

  // Nepali
  const formatPrice = (price: number) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "decimal", // or "currency" if you want automatic symbol (but we'll override)
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)

    return `NPR ${formatted}`
  }
  const handleMarkerClick = useCallback(
    (property: Property) => {
      setSelectedProperty((prev) =>
        prev?._id === property._id ? null : property,
      )
      onPropertyClick?.(property)
    },
    [onPropertyClick],
  )

  return (
    <Map
      initialViewState={{
        longitude: 83.465,
        latitude: 27.707,
        zoom: 11,
      }}
      style={{ width: "100%", height: "100%" }}
      // mapStyle="https://cdn.jsdelivr.net/npm/osm-liberty@latest/positron.json"
      // Recommended free alternatives (copy-paste one):
      // mapStyle="https://tiles.stadiamaps.com/styles/alidade_smooth.json"
      mapStyle="https://tiles.stadiamaps.com/styles/outdoors.json"
      // mapStyle="https://api.maptiler.com/maps/streets-v2/style.json?key=YOUR_MAPTILER_KEY" ← if you get free key
      dragRotate={false}
      doubleClickZoom={true}
    >
      <NavigationControl position="top-right" />

      {validProperties.map((property) => {
        const isSelected = selectedProperty?._id === property._id

        return (
          <Marker
            key={property._id}
            longitude={property?.location?.lng ?? 0}
            latitude={property?.location?.lat ?? 0}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              handleMarkerClick(property)
            }}
          >
            <div className="cursor-pointer">
              <div className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-semibold shadow-md hover:bg-primary/90 transition-colors">
                {formatPrice(property.price)}
              </div>
            </div>
          </Marker>
        )
      })}

      {selectedProperty?.location && (
        <Popup
          longitude={selectedProperty.location.lng}
          latitude={selectedProperty.location.lat}
          anchor="top"
          onClose={() => setSelectedProperty(null)}
          closeButton={true}
          closeOnClick={false}
          className="property-popup"
        >
          <Link
            href={`/properties/${selectedProperty._id}`}
            className="block  min-w-[200px] hover:bg-muted/50 transition-colors rounded-md cursor-pointer"
          >
            <h3 className="font-semibold text-sm">{selectedProperty.title}</h3>
            <p className="text-lg font-bold text-primary">
              {formatPrice(selectedProperty.price)}
            </p>
            <div className="flex gap-2 text-xs text-muted-foreground mt-1">
              <span>{selectedProperty.bedrooms} beds</span>
              <span>•</span>
              <span>{selectedProperty.bathrooms} baths</span>
              {selectedProperty.squareFeet && (
                <>
                  <span>•</span>
                  <span>
                    {selectedProperty.squareFeet.toLocaleString()} sqft
                  </span>
                </>
              )}
            </div>
            {selectedProperty.address && (
              <p className="text-xs text-muted-foreground mt-1">
                {selectedProperty.address.city},{" "}
                {selectedProperty.address.state}
              </p>
            )}
          </Link>
        </Popup>
      )}
    </Map>
  )
}
