"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { createListing, updateListing } from "@/actions/properties"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { type ImageItem, ImageUpload } from "./ImageUpload"
import { LocationPicker } from "./LocationPicker"

const PROPERTY_TYPES = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "land", label: "Land" },
]

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "sold", label: "Sold" },
]

// Re-export Amenity type from shared types
import type { Amenity } from "@/types"
export type { Amenity }

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  propertyType: z.enum(["house", "apartment", "condo", "townhouse", "land"]),
  status: z.enum(["active", "pending", "sold"]).optional(),
  bedrooms: z.coerce.number().min(0),
  bathrooms: z.coerce.number().min(0),
  squareFeet: z.coerce.number().min(0),
  yearBuilt: z.coerce
    .number()
    .min(1800)
    .max(new Date().getFullYear())
    .optional(),
  amenities: z.array(z.string()).optional(),
})

type FormDataInput = z.input<typeof formSchema>
type FormDataOutput = z.output<typeof formSchema>

interface ListingImage {
  asset: {
    _id: string
    url: string
  }
}

interface GeoPoint {
  lat: number
  lng: number
}

interface ListingFormProps {
  listing?: {
    _id: string
    title: string
    description?: string
    price: number
    propertyType: string
    status: string
    bedrooms: number
    bathrooms: number
    squareFeet: number
    yearBuilt?: number
    location?: GeoPoint
    amenities?: string[]
    images?: ListingImage[]
  }
  amenities: Amenity[]
  mode?: "create" | "edit"
}

export function ListingForm({
  listing,
  amenities,
  mode = "create",
}: ListingFormProps) {
  const [isPending, startTransition] = useTransition()

  console.log("Lising", listing)

  // Initialize images
  const initialImages: ImageItem[] =
    listing?.images?.map((img) => ({
      id: img.asset._id,
      url: img.asset.url,
      assetRef: img.asset._id,
    })) || []

  const [images, setImages] = useState<ImageItem[]>(initialImages)

  // Location state
  const [location, setLocation] = useState<GeoPoint | undefined>(
    listing?.location,
  )

  const form = useForm<FormDataInput, unknown, FormDataOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: listing?.title || "",
      description: listing?.description || "",
      price: listing?.price || 0,
      propertyType:
        (listing?.propertyType as FormDataOutput["propertyType"]) || "house",
      status: (listing?.status as FormDataOutput["status"]) || "active",
      bedrooms: listing?.bedrooms || 0,
      bathrooms: listing?.bathrooms || 0,
      squareFeet: listing?.squareFeet || 0,
      yearBuilt: listing?.yearBuilt,
      amenities: listing?.amenities || [],
    },
  })

  const onSubmit = (data: FormDataOutput) => {
    startTransition(async () => {
      try {
        // Prepare images for Sanity
        const imageRefs = images
          .filter((img) => !img.isUploading && img.assetRef)
          .map((img) => ({
            _type: "image" as const,
            _key: img.id,
            asset: {
              _type: "reference" as const,
              _ref: img.assetRef,
            },
          }))

        const formData = {
          title: data.title,
          description: data.description,
          price: data.price,
          propertyType: data.propertyType,
          status: data.status,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          squareFeet: data.squareFeet,
          yearBuilt: data.yearBuilt,
          location, // ← only lat/lng
          amenities: data.amenities,
          images: imageRefs,
        }

        if (mode === "edit" && listing) {
          await updateListing(listing._id, formData)
          toast.success("Listing updated successfully")
        } else {
          await createListing(formData)
          toast.success("Listing created successfully")
        }
      } catch (_error) {
        toast.error("Failed to save listing")
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Beautiful 3BR Home in Butwal"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the property..."
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (NPR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="12500000"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROPERTY_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {mode === "edit" && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Images</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              images={images}
              onChange={setImages}
              maxImages={10}
              disabled={isPending}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bathrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bathrooms</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="squareFeet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area (sq ft)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yearBuilt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year Built</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2018"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="amenities"
              render={({ field }) => (
                <FormItem>
                  {amenities.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {amenities.map((amenity) => (
                        <div
                          key={amenity._id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={amenity.value}
                            checked={field.value?.includes(amenity.value)}
                            onCheckedChange={(checked: boolean) => {
                              const current = field.value || []
                              if (checked) {
                                field.onChange([...current, amenity.value])
                              } else {
                                field.onChange(
                                  current.filter((v) => v !== amenity.value),
                                )
                              }
                            }}
                            disabled={isPending}
                          />
                          <label
                            htmlFor={amenity.value}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {amenity.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No amenities available. Add them in Sanity Studio.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Location</CardTitle>
            <p className="text-sm text-muted-foreground">
              Search for an address or click on the map to set / adjust the
              exact location pin.
            </p>
          </CardHeader>
          <CardContent>
            <LocationPicker
              value={location}
              onChange={setLocation}
              disabled={isPending}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <a href="/dashboard/listings">Cancel</a>
          </Button>
          <LoadingButton
            type="submit"
            loading={isPending}
            loadingText="Saving..."
          >
            {mode === "edit" ? "Update Listing" : "Create Listing"}
          </LoadingButton>
        </div>
      </form>
    </Form>
  )
}
