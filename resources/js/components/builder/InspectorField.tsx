import type { FieldSchema } from '@/types/builder'
import { useCallback, useState } from 'react'

interface Props {
  field: FieldSchema
  value: unknown
  onChange: (name: string, value: unknown) => void
}

export default function InspectorField({ field, value, onChange }: Props) {
  const handleChange = useCallback(
    (val: unknown) => onChange(field.name, val),
    [field.name, onChange]
  )

  const baseInputClass =
    'w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'

  switch (field.type) {
    case 'text':
    case 'number':
      return (
        <FieldWrapper label={field.label} required={field.required}>
          <input
            type={field.type === 'number' ? 'number' : 'text'}
            value={(value as string) ?? ''}
            onChange={(e) => handleChange(field.type === 'number' ? Number(e.target.value) : e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            className={baseInputClass}
          />
        </FieldWrapper>
      )

    case 'textarea':
    case 'richtext':
      return (
        <FieldWrapper label={field.label} required={field.required}>
          <textarea
            value={(value as string) ?? ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            rows={field.type === 'richtext' ? 5 : 3}
            className={baseInputClass}
          />
          {field.type === 'richtext' && (
            <p className="text-[10px] text-gray-400 mt-1">Supports HTML (bold, italic, links)</p>
          )}
        </FieldWrapper>
      )

    case 'select':
      return (
        <FieldWrapper label={field.label} required={field.required}>
          <select
            value={(value as string) ?? field.default ?? ''}
            onChange={(e) => handleChange(e.target.value)}
            className={baseInputClass}
          >
            <option value="">Select...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </FieldWrapper>
      )

    case 'toggle':
      return (
        <FieldWrapper label={field.label}>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleChange(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">{field.label}</span>
          </label>
        </FieldWrapper>
      )

    case 'image':
      return (
        <FieldWrapper label={field.label}>
          <ImageUpload value={value as string} onChange={handleChange} />
        </FieldWrapper>
      )

    case 'repeater':
      return (
        <FieldWrapper label={field.label}>
          <RepeaterField
            items={(value as Record<string, unknown>[]) ?? []}
            schema={field.schema ?? []}
            onChange={handleChange}
          />
        </FieldWrapper>
      )

    default:
      return null
  }
}

function FieldWrapper({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function ImageUpload({ value, onChange }: { value?: string; onChange: (url: unknown) => void }) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? ''
      const res = await fetch('/admin/api/builder/upload-image', {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': csrfToken, Accept: 'application/json' },
        body: formData,
      })
      const data = await res.json()
      onChange(data.url)
    } catch {
      // Silently fail
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      {value && (
        <img src={value} alt="" className="w-full h-24 object-cover rounded-lg border dark:border-gray-600" />
      )}
      <label className="flex items-center justify-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-400 hover:text-blue-500 transition-colors">
        {uploading ? 'Uploading...' : value ? 'Replace Image' : 'Upload Image'}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        />
      </label>
      {value && (
        <button
          onClick={() => onChange(null)}
          className="text-xs text-red-500 hover:text-red-700"
        >
          Remove
        </button>
      )}
    </div>
  )
}

function RepeaterField({
  items,
  schema,
  onChange,
}: {
  items: Record<string, unknown>[]
  schema: FieldSchema[]
  onChange: (items: unknown) => void
}) {
  const updateItem = (index: number, name: string, value: unknown) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [name]: value }
    onChange(updated)
  }

  const addItem = () => {
    const defaults: Record<string, unknown> = {}
    schema.forEach((f) => {
      defaults[f.name] = f.default ?? (f.type === 'toggle' ? false : '')
    })
    onChange([...items, defaults])
  }

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Item {index + 1}</span>
            <button onClick={() => removeItem(index)} className="text-xs text-red-500 hover:text-red-700">
              Remove
            </button>
          </div>
          {schema.map((field) => (
            <InspectorField
              key={field.name}
              field={field}
              value={item[field.name]}
              onChange={(name, val) => updateItem(index, name, val)}
            />
          ))}
        </div>
      ))}
      <button
        onClick={addItem}
        className="w-full py-2 text-sm text-blue-600 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
      >
        + Add Item
      </button>
    </div>
  )
}
