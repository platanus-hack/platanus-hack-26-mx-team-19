/** Primitive field types at the top level and inside object shapes. */
export type OutputSchemaPrimitiveType = "string" | "number" | "boolean" | "string[]"

/** Field types supported by the visual schema builder. */
export type OutputSchemaFieldType = OutputSchemaPrimitiveType | "object" | "object[]"

export type OutputSchemaObjectProperty = {
  id: string
  name: string
  type: OutputSchemaFieldType
  required: boolean
  description?: string
  /** Nested shape when type is `object` or `object[]`. */
  objectProperties?: OutputSchemaObjectProperty[]
}

export type OutputSchemaField = {
  id: string
  name: string
  type: OutputSchemaFieldType
  required: boolean
  description?: string
  /** Nested properties when type is `object` or `object[]`. */
  objectProperties?: OutputSchemaObjectProperty[]
}

export function createEmptyObjectProperty(): OutputSchemaObjectProperty {
  return {
    id: `p_${Math.random().toString(36).slice(2, 9)}`,
    name: "",
    type: "string",
    required: true,
  }
}

export function createEmptyField(): OutputSchemaField {
  return {
    id: `f_${Math.random().toString(36).slice(2, 9)}`,
    name: "",
    type: "string",
    required: true,
  }
}

export function isObjectFieldType(type: OutputSchemaFieldType): boolean {
  return type === "object" || type === "object[]"
}

type FieldsToJsonSchemaOptions = {
  /** When true, every named field is listed in `required` (output schemas). */
  allFieldsRequired?: boolean
}

function primitiveTypeToJsonSchema(
  type: OutputSchemaPrimitiveType,
  description?: string,
): Record<string, unknown> {
  const prop: Record<string, unknown> =
    type === "string[]" ? { type: "array", items: { type: "string" } } : { type: type }

  if (description?.trim()) {
    prop.description = description.trim()
  }
  return prop
}

function objectPropertyToJsonSchema(
  prop: OutputSchemaObjectProperty,
  options?: FieldsToJsonSchemaOptions,
): Record<string, unknown> {
  const objectSchema = objectPropertiesToJsonSchema(prop.objectProperties ?? [], options)

  if (prop.type === "object") {
    if (prop.description?.trim()) {
      objectSchema.description = prop.description.trim()
    }
    return objectSchema
  }

  if (prop.type === "object[]") {
    const schema: Record<string, unknown> = {
      type: "array",
      items: objectSchema,
    }
    if (prop.description?.trim()) {
      schema.description = prop.description.trim()
    }
    return schema
  }

  return primitiveTypeToJsonSchema(prop.type, prop.description)
}

function objectPropertiesToJsonSchema(
  properties: OutputSchemaObjectProperty[],
  options?: FieldsToJsonSchemaOptions,
): Record<string, unknown> {
  const schemaProperties: Record<string, unknown> = {}
  const required: string[] = []

  for (const prop of properties) {
    const key = prop.name.trim()
    if (!key) continue
    if (prop.required || options?.allFieldsRequired) required.push(key)
    schemaProperties[key] = objectPropertyToJsonSchema(prop, options)
  }

  return {
    type: "object",
    additionalProperties: false,
    required,
    properties: schemaProperties,
  }
}

function fieldToJsonSchemaProperty(
  field: OutputSchemaField,
  options?: FieldsToJsonSchemaOptions,
): Record<string, unknown> {
  const objectSchema = objectPropertiesToJsonSchema(field.objectProperties ?? [], options)

  if (field.type === "object") {
    if (field.description?.trim()) {
      objectSchema.description = field.description.trim()
    }
    return objectSchema
  }

  if (field.type === "object[]") {
    const prop: Record<string, unknown> = {
      type: "array",
      items: objectSchema,
    }
    if (field.description?.trim()) {
      prop.description = field.description.trim()
    }
    return prop
  }

  const prop = primitiveTypeToJsonSchema(field.type, field.description)
  return prop
}

/** Builds JSON Schema stored on `agent_workers.outputSchema` (OpenAI strict-compatible). */
export function fieldsToJsonSchema(
  fields: OutputSchemaField[],
  options?: FieldsToJsonSchemaOptions,
): Record<string, unknown> {
  const properties: Record<string, unknown> = {}
  const required: string[] = []

  for (const field of fields) {
    const key = field.name.trim()
    if (!key) continue
    if (field.required || options?.allFieldsRequired) required.push(key)
    properties[key] = fieldToJsonSchemaProperty(field, options)
  }

  if (Object.keys(properties).length === 0) {
    return {}
  }

  return {
    type: "object",
    additionalProperties: false,
    required,
    properties,
  }
}

export function schemaToText(schema?: Record<string, unknown>): string {
  if (!schema || Object.keys(schema).length === 0) return ""
  return JSON.stringify(schema, null, 2)
}

function parsePrimitiveType(def: Record<string, unknown>): OutputSchemaPrimitiveType | null {
  if (def.type === "string") return "string"
  if (def.type === "number" || def.type === "integer") return "number"
  if (def.type === "boolean") return "boolean"
  if (
    def.type === "array" &&
    def.items &&
    typeof def.items === "object" &&
    !Array.isArray(def.items) &&
    (def.items as Record<string, unknown>).type === "string"
  ) {
    return "string[]"
  }
  return null
}

function parseObjectPropertyShape(def: Record<string, unknown>): {
  type: OutputSchemaFieldType
  objectProperties?: OutputSchemaObjectProperty[]
} | null {
  if (def.type === "object") {
    const objectProperties = parseObjectProperties(def)
    if (objectProperties === null) return null
    return { type: "object", objectProperties }
  }

  if (
    def.type === "array" &&
    def.items &&
    typeof def.items === "object" &&
    !Array.isArray(def.items) &&
    (def.items as Record<string, unknown>).type === "object"
  ) {
    const objectProperties = parseObjectProperties(def.items as Record<string, unknown>)
    if (objectProperties === null) return null
    return { type: "object[]", objectProperties }
  }

  const primitive = parsePrimitiveType(def)
  if (!primitive) return null
  return { type: primitive }
}

function parseObjectProperties(
  schema: Record<string, unknown>,
): OutputSchemaObjectProperty[] | null {
  const props = schema.properties
  if (!props || typeof props !== "object") {
    return null
  }

  const required = new Set(
    Array.isArray(schema.required)
      ? schema.required.filter((k): k is string => typeof k === "string")
      : [],
  )

  const properties: OutputSchemaObjectProperty[] = []

  for (const [name, raw] of Object.entries(props as Record<string, unknown>)) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return null
    }
    const def = raw as Record<string, unknown>
    const parsed = parseObjectPropertyShape(def)
    if (!parsed) return null

    properties.push({
      id: name,
      name,
      type: parsed.type,
      required: required.has(name),
      description: typeof def.description === "string" ? def.description : undefined,
      objectProperties: parsed.objectProperties,
    })
  }

  return properties
}

/** Returns fields when schema is builder-compatible; `null` if too complex. */
export function jsonSchemaToFields(
  schema?: Record<string, unknown>,
): OutputSchemaField[] | null {
  if (!schema || typeof schema !== "object" || Object.keys(schema).length === 0) {
    return []
  }

  const props = schema.properties
  if (!props || typeof props !== "object") {
    return null
  }

  const required = new Set(
    Array.isArray(schema.required)
      ? schema.required.filter((k): k is string => typeof k === "string")
      : [],
  )

  const fields: OutputSchemaField[] = []

  for (const [name, raw] of Object.entries(props as Record<string, unknown>)) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return null
    }
    const def = raw as Record<string, unknown>
    let type: OutputSchemaFieldType | null = null
    let objectProperties: OutputSchemaObjectProperty[] | undefined

    if (def.type === "object") {
      const parsed = parseObjectProperties(def)
      if (parsed === null) return null
      type = "object"
      objectProperties = parsed
    } else if (
      def.type === "array" &&
      def.items &&
      typeof def.items === "object" &&
      !Array.isArray(def.items) &&
      (def.items as Record<string, unknown>).type === "object"
    ) {
      const parsed = parseObjectProperties(def.items as Record<string, unknown>)
      if (parsed === null) return null
      type = "object[]"
      objectProperties = parsed
    } else {
      type = parsePrimitiveType(def)
      if (!type) return null
    }

    fields.push({
      id: name,
      name,
      type,
      required: required.has(name),
      description: typeof def.description === "string" ? def.description : undefined,
      objectProperties,
    })
  }

  return fields
}

export function hasBuilderFields(fields: OutputSchemaField[]): boolean {
  return fields.some((f) => f.name.trim().length > 0)
}
