import { defineField, defineType } from "sanity"

export const userSchema = defineType({
  name: "user",
  title: "Users",
  type: "document",
  icon: () => "👤",
  fields: [
    defineField({
      name: "clerkId",
      title: "Clerk ID",
      type: "string",
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
    }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "savedListings",
      title: "Saved Listings",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "property" }],
        },
      ],
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "email",
      media: "photo",
    },
  },
})
