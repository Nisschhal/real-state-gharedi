import { MdOutlineEmail } from "react-icons/md"
import { defineField, defineType } from "sanity"

// --------- LEAD DOCUMENT SCHEMA ---------
//     propertyId: "seed_property_1",
//     agentId: "seed_agent_1",
//     buyerName: "Thomas Wright",
//     buyerEmail: "thomas.wright@email.com",
//     buyerPhone: "(415) 555-2001",
//     message:
//       "I'm very interested in this property. Would love to schedule a viewing this weekend if possible.",
//     status: "new",
//     daysAgo: 1,
//   }

export const leadSchema = defineType({
  // --- BASIC IDENTITY ---
  name: "lead", // Technical ID used in your code/queries (e.g., in GROQ)
  title: "Leads", // Human-friendly name shown in the Sanity Dashboard
  type: "document", // Means this is a main "page" or "entry" in your database
  icon: MdOutlineEmail, // Visual icon for the sidebar (optional)
  fields: [
    defineField({
      name: "property",
      title: "Property",
      type: "reference",
      to: [{ type: "property" }],
    }),
    defineField({
      name: "agent",
      title: "Agent",
      type: "reference",
      to: [{ type: "agent" }],
    }),
    defineField({
      name: "buyerName",
      title: "Buyer Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "buyerEmail",
      title: "Buyer Email",
      type: "string",
      validation: (Rule) =>
        Rule.required().email().error("Please enter a valid email address"),
    }),
    defineField({
      name: "buyerPhone",
      title: "Buyer Phone",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "message",
      title: "Message",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { value: "new", title: "New" },
          { value: "contacted", title: "Contacted" },
          { value: "closed", title: "Closed" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      buyerName: "buyerName",
      buyerEmail: "buyerEmail",
      propertyTitle: "property.title",
      status: "status",
    },
    prepare({ buyerName, buyerEmail, propertyTitle, status }) {
      return {
        title: buyerName ?? buyerEmail ?? "Unnamed Lead",
        subtitle: `${propertyTitle} * ${status}`,
      }
    },
  },
})
