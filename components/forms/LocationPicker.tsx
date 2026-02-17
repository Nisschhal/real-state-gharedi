// "use client"

// import { useCallback, useEffect, useState } from "react"
// import MapGL, { Marker, NavigationControl } from "react-map-gl/mapbox"
// import "mapbox-gl/dist/mapbox-gl.css"
// import { MapPin } from "lucide-react"
// import type { GeoPoint } from "@/types"

// interface LocationPickerProps {
//   value?: GeoPoint
//   onChange: (location: GeoPoint) => void
//   disabled?: boolean
// }

// export function LocationPicker({
//   value,
//   onChange,
//   disabled,
// }: LocationPickerProps) {
//   const [viewState, setViewState] = useState({
//     longitude: value?.lng ?? -98.5795,
//     latitude: value?.lat ?? 39.8283,
//     zoom: value ? 14 : 4,
//   })

//   // Sync viewState when value prop changes (e.g., from address autocomplete)
//   useEffect(() => {
//     if (value) {
//       setViewState((prev) => ({
//         ...prev,
//         longitude: value.lng,
//         latitude: value.lat,
//         zoom: 15, // Zoom in when address is selected
//       }))
//     }
//   }, [value?.lat, value?.lng, value])

//   const handleMapClick = useCallback(
//     (event: { lngLat: { lng: number; lat: number } }) => {
//       if (disabled) return

//       const { lng, lat } = event.lngLat
//       onChange({ lat, lng })

//       // Center map on the clicked location
//       setViewState((prev) => ({
//         ...prev,
//         longitude: lng,
//         latitude: lat,
//         zoom: Math.max(prev.zoom, 14),
//       }))
//     },
//     [onChange, disabled],
//   )

//   return (
//     <div className="space-y-2">
//       <div
//         className={`relative h-[300px] w-full rounded-lg overflow-hidden border ${disabled ? "opacity-50 pointer-events-none" : ""}`}
//       >
//         <MapGL
//           {...viewState}
//           onMove={(evt) => setViewState(evt.viewState)}
//           onClick={handleMapClick}
//           style={{ width: "100%", height: "100%" }}
//           mapStyle="mapbox://styles/mapbox/streets-v12"
//           mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
//           cursor={disabled ? "default" : "crosshair"}
//         >
//           <NavigationControl position="top-right" />

//           {value && (
//             <Marker longitude={value.lng} latitude={value.lat} anchor="bottom">
//               <div className="text-primary">
//                 <MapPin className="h-8 w-8 fill-primary stroke-white drop-shadow-lg" />
//               </div>
//             </Marker>
//           )}
//         </MapGL>
//       </div>

//       {value ? (
//         <p className="text-sm text-muted-foreground">
//           📍 Selected: {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
//         </p>
//       ) : (
//         <p className="text-sm text-muted-foreground">
//           Select an address above or click on the map to set the property
//           location
//         </p>
//       )}
//     </div>
//   )
// }
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import { MapPin, Search, AlertCircle } from "lucide-react"
import type { GeoPoint } from "@/types"
import { Input } from "@/components/ui/input"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface LocationPickerProps {
  value?: GeoPoint
  onChange: (location: GeoPoint) => void
  disabled?: boolean
}

interface Suggestion {
  place_id: string
  display_name: string
  lat: string
  lon: string
}

export function LocationPicker({
  value,
  onChange,
  disabled = false,
}: LocationPickerProps) {
  const [viewState, setViewState] = useState({
    longitude: value?.lng ?? 83.4,
    latitude: value?.lat ?? 27.5,
    zoom: value ? 15 : 7,
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const hasRunInitialReverse = useRef(false)
  const popoverWrapperRef = useRef<HTMLDivElement>(null)
  const [popoverWidth, setPopoverWidth] = useState<string>("100%")

  // Measure popover width
  useEffect(() => {
    const updateWidth = () => {
      if (popoverWrapperRef.current) {
        const width = popoverWrapperRef.current.getBoundingClientRect().width
        setPopoverWidth(`${width}px`)
      }
    }

    updateWidth()
    window.addEventListener("resize", updateWidth)
    window.addEventListener("focus", updateWidth)

    return () => {
      window.removeEventListener("resize", updateWidth)
      window.removeEventListener("focus", updateWidth)
    }
  }, [])

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  // ────────────────────────────────────────────────
  // Run reverse geocoding ONCE when loading existing location (edit mode)
  // ────────────────────────────────────────────────
  useEffect(() => {
    if (value && !searchQuery.trim() && !hasRunInitialReverse.current) {
      hasRunInitialReverse.current = true

      const doReverse = async () => {
        try {
          const res = await fetch(
            `https://api.locationiq.com/v1/reverse?key=${process.env.NEXT_PUBLIC_LOCATIONIQ_KEY}&lat=${value.lat}&lon=${value.lng}&format=json&addressdetails=1&zoom=16&normalizeaddress=1`,
          )

          if (!res.ok) throw new Error("Reverse failed")

          const data = await res.json()
          console.log("initial reverse geocoding result:", data)

          let name = data.display_name

          // Optional: nicer fallback for Nepal
          if (!name || name.length > 120 || name.includes("Unnamed")) {
            const addr = data.address || {}
            name =
              [
                addr.road || addr.hamlet || addr.neighbourhood || "",
                addr.city || addr.town || addr.village || addr.county || "",
                addr.state_district || addr.state || "",
                addr.country || "",
              ]
                .filter(Boolean)
                .join(", ") ||
              `${value.lat.toFixed(6)}, ${value.lng.toFixed(6)}`
          }

          setSearchQuery(name)
        } catch (err) {
          console.error("Initial reverse geocoding error:", err)
          setSearchQuery(`${value.lat.toFixed(6)}, ${value.lng.toFixed(6)}`)
        }
      }

      doReverse()
    }
  }, [value?.lat, value?.lng]) // eslint-disable-line react-hooks/exhaustive-deps

  const triggerSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      setError(null)
      return
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    debounceTimer.current = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `https://api.locationiq.com/v1/autocomplete?key=${process.env.NEXT_PUBLIC_LOCATIONIQ_KEY}&q=${encodeURIComponent(
            searchQuery,
          )}&limit=6&countrycodes=np&format=json`,
        )

        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const data: Suggestion[] = await res.json()

        const uniqueMap: Record<string, Suggestion> = {}
        data.forEach((item) => {
          if (!uniqueMap[item.place_id]) {
            uniqueMap[item.place_id] = item
          }
        })

        const uniqueSuggestions = Object.values(uniqueMap)
        setSuggestions(uniqueSuggestions)

        if (uniqueSuggestions.length > 0) {
          setOpen(true)
        }
      } catch (err) {
        console.error("Search error:", err)
        setError(
          "No results found – try different keywords or click on the map",
        )
      } finally {
        setLoading(false)
      }
    }, 500)
  }, [searchQuery])

  // Typing → debounce search
  useEffect(() => {
    triggerSearch()
  }, [searchQuery, triggerSearch])

  const handleFocus = () => {
    setTimeout(() => {
      if (suggestions.length > 0 || loading || error) {
        setOpen(true)
      } else if (!searchQuery && !loading && !error) {
        setSuggestions([])
      }
    }, 100)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      triggerSearch()
    }
  }

  const handleSearchIconClick = () => {
    triggerSearch()
  }

  const handleSelect = (sugg: Suggestion) => {
    const lat = parseFloat(sugg.lat)
    const lng = parseFloat(sugg.lon)

    if (!isNaN(lat) && !isNaN(lng)) {
      onChange({ lat, lng })
      setViewState({ longitude: lng, latitude: lat, zoom: 15 })
      setSearchQuery(sugg.display_name)
      setOpen(false)
      setSuggestions([])
    }
  }

  const handleMapClick = useCallback(
    (event: { lngLat: { lng: number; lat: number } }) => {
      if (disabled) return

      const { lng, lat } = event.lngLat
      const rounded = {
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
      }

      onChange(rounded)

      setViewState((prev) => ({
        ...prev,
        longitude: rounded.lng,
        latitude: rounded.lat,
        zoom: Math.max(prev.zoom, 14),
      }))

      setTimeout(async () => {
        try {
          const res = await fetch(
            `https://api.locationiq.com/v1/reverse?key=${process.env.NEXT_PUBLIC_LOCATIONIQ_KEY}&lat=${rounded.lat}&lon=${rounded.lng}&format=json&addressdetails=1&zoom=16&normalizeaddress=1`,
          )

          if (res.ok) {
            const data = await res.json()
            console.log("map click reverse:", data)
            let name = data.display_name

            // Optional nicer fallback
            if (!name || name.length > 120 || name.includes("Unnamed")) {
              const addr = data.address || {}
              name =
                [
                  addr.road || addr.hamlet || addr.neighbourhood || "",
                  addr.city || addr.town || addr.village || addr.county || "",
                  addr.state_district || addr.state || "",
                  addr.country || "",
                ]
                  .filter(Boolean)
                  .join(", ") ||
                `${rounded.lat.toFixed(6)}, ${rounded.lng.toFixed(6)}`
            }

            setSearchQuery(name)
            // Optional: re-trigger forward search if you want suggestions again
            // setTimeout(triggerSearch, 600)
          } else {
            setSearchQuery(
              `${rounded.lat.toFixed(6)}, ${rounded.lng.toFixed(6)}`,
            )
          }
        } catch (err) {
          console.error("Reverse error:", err)
          setSearchQuery(`${rounded.lat.toFixed(6)}, ${rounded.lng.toFixed(6)}`)
        }
      }, 300)
    },
    [onChange, disabled],
  )

  return (
    <div className="space-y-4 relative w-full">
      <div
        className="relative w-full overflow-hidden p-1"
        ref={popoverWrapperRef}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild className="">
            <div className="relative w-full">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search address (e.g. Butwal, Lumbini...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                className="pl-10 pr-10 w-full"
                autoComplete="off"
              />
              <div
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center cursor-pointer"
                onClick={handleSearchIconClick}
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <Search className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                )}
              </div>
            </div>
          </PopoverTrigger>

          <PopoverContent
            side="bottom"
            align="start"
            sideOffset={8}
            className="
              p-0 m-0 
              rounded-t-none 
              border-t-0 
              shadow-lg 
              overflow-hidden
              text-sm
            "
            style={{ width: popoverWidth }}
            avoidCollisions={true}
            forceMount
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Command shouldFilter={false} loop>
              <CommandEmpty className="pt-2 px-2 !w-full ">
                Type to search for an address or click on the map to set
                location
              </CommandEmpty>
              <CommandList className="max-h-[300px] overflow-y-auto ">
                {loading && <CommandItem disabled>Searching...</CommandItem>}
                {error && (
                  <CommandItem
                    disabled
                    className="text-destructive !w-full flex gap-2 px-3 py-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </CommandItem>
                )}
                {!loading &&
                  !error &&
                  suggestions.length === 0 &&
                  searchQuery.trim() && (
                    <CommandEmpty>No results found</CommandEmpty>
                  )}
                <CommandGroup className="p-1">
                  {suggestions.map((sugg) => (
                    <CommandItem
                      key={sugg.place_id}
                      onSelect={() => handleSelect(sugg)}
                      className="cursor-pointer px-3 py-2.5 hover:bg-accent rounded-sm p-1 "
                    >
                      {sugg.display_name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div
        className={`relative w-full rounded-xl overflow-hidden border border-border shadow-sm ${
          disabled ? "opacity-60 pointer-events-none" : ""
        }`}
        style={{ height: "340px" }}
      >
        <Map
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          onClick={handleMapClick}
          style={{ width: "100%", height: "100%" }}
          mapStyle="https://tiles.stadiamaps.com/styles/outdoors.json"
          dragRotate={false}
          doubleClickZoom={true}
          cursor={disabled ? "default" : "crosshair"}
        >
          <NavigationControl position="top-right" showCompass={false} />

          {value && (
            <Marker longitude={value.lng} latitude={value.lat} anchor="bottom">
              <div className="relative -mb-1">
                <MapPin className="h-10 w-10 text-red-600 fill-red-500/40 stroke-white drop-shadow-xl" />
              </div>
            </Marker>
          )}
        </Map>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        {value ? (
          <span>
            Selected:{" "}
            <code>
              {searchQuery ||
                `${value.lat.toFixed(6)}, ${value.lng.toFixed(6)}`}
            </code>
          </span>
        ) : (
          <span>Search or click map to set location</span>
        )}
        <div>© OpenStreetMap • Stadia Maps</div>
      </div>
    </div>
  )
}
