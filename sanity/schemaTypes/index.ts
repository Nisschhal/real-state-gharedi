import { type SchemaTypeDefinition } from "sanity"
import { agentSchema } from "./agentSchema"
import { propertySchema } from "./propertySchema"
import { leadSchema } from "./leadSchema"
import { amenitySchema } from "./ameneties"
import { userSchema } from "./userSchema"

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [leadSchema, agentSchema, userSchema, propertySchema, amenitySchema],
}
