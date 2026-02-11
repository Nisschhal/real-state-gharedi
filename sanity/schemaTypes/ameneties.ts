import { MdOutlinePool } from "react-icons/md"
import { defineType, defineField } from "sanity"

// --------- AMENITIES SCHEMA ---------
// value: "pool",
// label: "Swimming Pool",
// icon: "waves",
// order: 1,

export const amenitySchema = defineType({
  // --- BASIC IDENTITY ---
  name: "amenity", // Technical ID used in your code/queries (e.g., in GROQ)
  title: "Amenities", // Human-friendly name shown in the Sanity Dashboard
  type: "document", // Means this is a main "page" or "entry" in your database
  icon: MdOutlinePool, // Visual icon for the sidebar (optional)
  fields: [
    defineField({
      name: "value",
      title: "Value",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      description:
        "Name of the icon representing this amenity (e.g., 'pool', 'wifi', 'parking'). This will be used to display the correct icon on the frontend.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description:
        "A number to determine the display order of amenities. Lower numbers appear first.",
      validation: (Rule) =>
        Rule.required()
          .integer()
          .positive()
          .error("Order must be a positive integer"),
    }),
  ],
  preview: {
    select: {
      title: "label",
      subtitle: "value",
    },
  },
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
})
