"use client"

import { TbPlus, TbTrash } from "react-icons/tb"
import {
  createEmptyField,
  createEmptyObjectProperty,
  isObjectFieldType,
  type OutputSchemaField,
  type OutputSchemaFieldType,
  type OutputSchemaObjectProperty,
} from "@/lib/output-schema-builder"
import styles from "./SchemaFieldBuilder.module.css"

type Props = {
  fields: OutputSchemaField[]
  onChange: (fields: OutputSchemaField[]) => void
  /** Show the per-field required checkbox (input schemas). */
  showRequired?: boolean
}

const TYPE_OPTIONS: { value: OutputSchemaFieldType; label: string }[] = [
  { value: "string", label: "string" },
  { value: "number", label: "number" },
  { value: "boolean", label: "boolean" },
  { value: "string[]", label: "string[]" },
  { value: "object", label: "object" },
  { value: "object[]", label: "object[]" },
]

function ensureObjectProperties(field: OutputSchemaField): OutputSchemaField {
  if (!isObjectFieldType(field.type)) return field
  if (field.objectProperties && field.objectProperties.length > 0) return field
  return { ...field, objectProperties: [createEmptyObjectProperty()] }
}

function ensurePropertyNestedShape(prop: OutputSchemaObjectProperty): OutputSchemaObjectProperty {
  if (!isObjectFieldType(prop.type)) return prop
  if (prop.objectProperties && prop.objectProperties.length > 0) return prop
  return { ...prop, objectProperties: [createEmptyObjectProperty()] }
}

function patchField(
  fields: OutputSchemaField[],
  index: number,
  partial: Partial<OutputSchemaField>,
): OutputSchemaField[] {
  const next = [...fields]
  const current = next[index]
  let updated: OutputSchemaField = { ...current, ...partial } as OutputSchemaField

  if (partial.type && isObjectFieldType(partial.type)) {
    updated = ensureObjectProperties(updated)
  }

  if (partial.type && !isObjectFieldType(partial.type)) {
    updated = { ...updated, objectProperties: undefined }
  }

  next[index] = updated
  return next
}

function patchObjectProperty(
  properties: OutputSchemaObjectProperty[],
  propIndex: number,
  partial: Partial<OutputSchemaObjectProperty>,
): OutputSchemaObjectProperty[] {
  const next = [...properties]
  const current = next[propIndex]
  let updated: OutputSchemaObjectProperty = { ...current, ...partial } as OutputSchemaObjectProperty

  if (partial.type && isObjectFieldType(partial.type)) {
    updated = ensurePropertyNestedShape(updated)
  }

  if (partial.type && !isObjectFieldType(partial.type)) {
    updated = { ...updated, objectProperties: undefined }
  }

  next[propIndex] = updated
  return next
}

type ObjectShapeEditorProps = {
  label: string
  properties: OutputSchemaObjectProperty[]
  onChange: (properties: OutputSchemaObjectProperty[]) => void
  showRequired: boolean
  nested?: boolean
}

function ObjectShapeEditor({
  label,
  properties,
  onChange,
  showRequired,
  nested = false,
}: ObjectShapeEditorProps) {
  return (
    <div className={`${styles.nested}${nested ? ` ${styles.nestedNested}` : ""}`}>
      <p className={styles.nestedLabel}>{label}</p>
      <ul className={styles.nestedList}>
        {properties.map((prop, propIndex) => (
          <li key={prop.id} className={styles.nestedItem}>
            <div className={styles.nestedRow}>
              <input
                className={`${styles.nameInput} ${styles.nestedInput}`}
                placeholder="property_name"
                value={prop.name}
                onChange={(e) =>
                  onChange(patchObjectProperty(properties, propIndex, { name: e.target.value }))
                }
              />
              <select
                className={`${styles.typeSelect} ${styles.nestedSelect}`}
                value={prop.type}
                onChange={(e) =>
                  onChange(
                    patchObjectProperty(properties, propIndex, {
                      type: e.target.value as OutputSchemaFieldType,
                    }),
                  )
                }
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {showRequired ? (
                <label className={styles.reqCheck} title="Required">
                  <input
                    type="checkbox"
                    checked={prop.required}
                    onChange={(e) =>
                      onChange(
                        patchObjectProperty(properties, propIndex, { required: e.target.checked }),
                      )
                    }
                  />
                  <span>req</span>
                </label>
              ) : (
                <span className={styles.reqSpacer} aria-hidden />
              )}
              <button
                type="button"
                className={styles.removeBtn}
                aria-label="Remove property"
                disabled={properties.length <= 1}
                onClick={() => {
                  const nextProps = properties.filter((_, i) => i !== propIndex)
                  onChange(nextProps.length > 0 ? nextProps : [createEmptyObjectProperty()])
                }}
              >
                <TbTrash size={14} />
              </button>
            </div>

            {isObjectFieldType(prop.type) ? (
              <ObjectShapeEditor
                label={prop.type === "object[]" ? "Object shape (each item)" : "Object properties"}
                properties={prop.objectProperties ?? []}
                onChange={(next) =>
                  onChange(
                    patchObjectProperty(properties, propIndex, { objectProperties: next }),
                  )
                }
                showRequired={showRequired}
                nested
              />
            ) : null}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={styles.addNestedBtn}
        onClick={() => onChange([...properties, createEmptyObjectProperty()])}
      >
        <TbPlus size={12} aria-hidden />
        Add property
      </button>
    </div>
  )
}

export default function SchemaFieldBuilder({ fields, onChange, showRequired = false }: Props) {
  return (
    <div className={styles.builder}>
      <ul className={styles.fieldList}>
        {fields.map((field, index) => (
          <li key={field.id} className={styles.fieldBlock}>
            <div className={styles.fieldRow}>
              <input
                className={styles.nameInput}
                placeholder="field_name"
                value={field.name}
                onChange={(e) => onChange(patchField(fields, index, { name: e.target.value }))}
              />
              <select
                className={styles.typeSelect}
                value={field.type}
                onChange={(e) =>
                  onChange(
                    patchField(fields, index, {
                      type: e.target.value as OutputSchemaFieldType,
                    }),
                  )
                }
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {showRequired ? (
                <label className={styles.reqCheck} title="Required">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) =>
                      onChange(patchField(fields, index, { required: e.target.checked }))
                    }
                  />
                  <span>req</span>
                </label>
              ) : null}
              <button
                type="button"
                className={styles.removeBtn}
                aria-label="Remove field"
                disabled={fields.length <= 1}
                onClick={() => {
                  const next = fields.filter((_, i) => i !== index)
                  onChange(next.length > 0 ? next : [createEmptyField()])
                }}
              >
                <TbTrash size={14} />
              </button>
            </div>

            {isObjectFieldType(field.type) ? (
              <ObjectShapeEditor
                label={field.type === "object[]" ? "Object shape (each item)" : "Object properties"}
                properties={field.objectProperties ?? []}
                onChange={(next) =>
                  onChange(patchField(fields, index, { objectProperties: next }))
                }
                showRequired={showRequired}
              />
            ) : null}
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={styles.addBtn}
        onClick={() => onChange([...fields, createEmptyField()])}
      >
        <TbPlus size={14} aria-hidden />
        Add field
      </button>
    </div>
  )
}
