import { UserPenIcon } from "lucide-react"
import { defineField, defineType } from "sanity"
import { MdOutlineRealEstateAgent } from "react-icons/md"

// --------- AGENT DOCUMENT SCHEMA ---------
//     userId: "seed_clerk_agent_1",
//     name: "Sarah Mitchell",
//     email: "sarah.mitchell@remax.com",
//     phone: "(415) 555-0101",
//     bio: "With over 15 years of experience in the San Francisco Bay Area real estate market, I specialize in luxury homes and investment properties. My dedication to client satisfaction and deep market knowledge have helped hundreds of families find their dream homes. I believe in building lasting relationships and providing personalized service every step of the way.",
//     licenseNumber: "DRE#01892345",
//     agency: "RE/MAX Premier",
//     photoUrl: -> Uploaded to photo
//       "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
//     onboardingComplete: true,
// --------------------------------------------------

export const agentSchema = defineType({
  // --- BASIC IDENTITY ---
  name: "agent", // Technical ID used in your code/queries (e.g., in GROQ)
  title: "Agents", // Human-friendly name shown in the Sanity Dashboard
  type: "document", // Means this is a main "page" or "entry" in your database
  icon: MdOutlineRealEstateAgent, // Visual icon for the sidebar
  fields: [
    // Clerk User ID reference (string)
    defineField({
      name: "userId",
      title: "Clerk User ID",
      type: "string",
      description: "The Clerk User ID associated with this agent",
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
      validation: (Rule) =>
        Rule.required().email().error("Please enter a valid email address"),
    }),
    defineField({
      name: "phone",
      title: "Phone Number",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "licenseNumber",
      title: "License Number",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "agency",
      title: "Agency",
      type: "string",
      validation: (Rule) => Rule.required(),
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
      name: "onboardingComplete",
      title: "Onboarding Complete",
      type: "boolean",
      description: "Has the agent completed the onboarding process?",
      initialValue: false,
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      readOnly: true,
      description: "The date and time when the agent was created",
      // Trigger once during document creation to set the initial timestamp
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "updatedAt",
      title: "Last Updated (System)",
      type: "datetime",
      readOnly: true,
      // This pulls the actual system update time into the field for display
      initialValue: (context) => context.document?._updatedAt,
    }),
  ],
  preview: {
    select: {
      name: "name",
      email: "email",
      agency: "agency",
      photo: "photo",
    },
    prepare({ name, email, agency, photo }) {
      return {
        title: name ?? "Unnamed Agent",
        subtitle: `${agency} * ${email}`,
        media: photo,
      }
    },
  },
})
