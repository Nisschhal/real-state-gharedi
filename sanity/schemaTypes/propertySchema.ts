import { MdOutlineHouse } from "react-icons/md"
import { defineField, defineType } from "sanity"

// --------- PROPERTY DOCUMENT SCHEMA ---------
// title: "Modern Hillside Estate with Bay Views",
// slug: "modern-hillside-estate-bay-views",
// description:
//   "Stunning contemporary home perched on the hills of San Francisco with panoramic views of the Bay. This architectural masterpiece features floor-to-ceiling windows, an open floor plan, chef's kitchen with premium appliances, and a seamless indoor-outdoor living experience. The primary suite offers a spa-like bathroom and private terrace. Smart home technology throughout.",
// price: 3450000,
// propertyType: "house",
// status: "active",
// bedrooms: 5,
// bathrooms: 4,
// squareFeet: 4200,
// yearBuilt: 2019,
// address: {
//   street: "1847 Twin Peaks Blvd",
//   city: "San Francisco",
//   state: "CA",
//   zipCode: "94131",

export const propertySchema = defineType({
  // --- BASIC IDENTITY ---
  name: "property", // Technical ID used in your code/queries (e.g., in GROQ)
  title: "Properties", // Human-friendly name shown in the Sanity Dashboard
  type: "document", // Means this is a main "page" or "entry" in your database
  icon: MdOutlineHouse, // Visual icon for the sidebar (optional)
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "number",
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: "propertyType",
      title: "Property Type",
      type: "string",
      options: {
        list: [
          { title: "House", value: "house" },
          { title: "Apartment", value: "apartment" },
          { title: "Condo", value: "condo" },
          { title: "Townhouse", value: "townhouse" },
          { title: "Land", value: "land" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Pending", value: "pending" },
          { title: "Sold", value: "sold" },
        ],
      },
      initialValue: "active",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "bedrooms",
      title: "Bedrooms",
      type: "number",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "bathrooms",
      title: "Bathrooms",
      type: "number",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "squareFeet",
      title: "Square Feet",
      type: "number",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "yearBuilt",
      title: "Year Built",
      type: "number",
      validation: (Rule) => Rule.min(1800).max(new Date().getFullYear()),
    }),
    defineField({
      name: "address",
      title: "Address",
      type: "object",
      fields: [
        defineField({
          name: "street",
          title: "Street",
          type: "string",
        }),
        defineField({
          name: "city",
          title: "City",
          type: "string",
        }),
        defineField({
          name: "state",
          title: "State",
          type: "string",
        }),
        defineField({
          name: "zipCode",
          title: "ZIP Code",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "geopoint",
      description: "Map location for property",
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [
        {
          type: "image",
          options: {
            hotspot: true,
          },
          fields: [
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "amenities",
      title: "Amenities",
      type: "array",
      of: [{ type: "string" }],
      description: "Amenity values are managed in the Amenities collection",
    }),
    // If you want to use references to the Amenity documents instead of just strings, you can use this instead:
    //     defineField({
    //   name: "amenities",
    //   title: "Amenities",
    //   type: "array",
    //   description: "Select amenities from the master list",
    //   of: [
    //     defineArrayMember({
    //       type: "reference",
    //       to: [{ type: "amenity" }], // This points to your amenitySchema name
    //     }),
    //   ],
    // }),
    defineField({
      name: "agent",
      title: "Agent",
      type: "reference",
      to: [{ type: "agent" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "lotSize",
      title: "Lot Size (sq ft)",
      type: "number",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "openHouseDate",
      title: "Open House Date",
      type: "datetime",
      description: "Scheduled open house date/time (if any)",
    }),
    defineField({
      name: "originalPrice",
      title: "Original Price",
      type: "number",
      description: "Original listing price (if reduced)",
      validation: (Rule) => Rule.positive(),
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "updatedAt",
      title: "Updated At",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      title: "title",
      price: "price",
      status: "status",
      media: "images.0",
    },
    prepare({ title, price, status, media }) {
      return {
        title,
        subtitle: `$${price?.toLocaleString()} - ${status}`,
        media,
      }
    },
  },
})
